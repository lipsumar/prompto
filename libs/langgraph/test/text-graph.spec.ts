import LangGraph from '../src/core/LangGraph';
import LangNode from '../src/core/LangNode';
import { langchain } from '../src/langchain';
import createInputNode from '../src/nodes/input';
import createLlmNode from '../src/nodes/llm';
import createTextNode from '../src/nodes/text';
import { ExecuteFunctionContext } from '../src/types';
import { createCtx } from './utils';

jest.mock('../src/langchain');
const langchainMock = langchain as jest.MockedFunction<typeof langchain>;

describe('graph', () => {
  test('single node', async () => {
    const node = new LangNode({
      id: 'n',
      async execute(inputs, opts) {
        return { default: { value: 'the prompt result', type: 'string' } };
      },
      outputs: { default: 'string' },
    });
    const graph = new LangGraph();
    graph.addNode(node);

    const res = await graph.executeNode('n', createCtx());
    expect(res).toEqual({
      default: { value: 'the prompt result', type: 'string' },
    });
  });

  test('input node', async () => {
    const graph = new LangGraph();
    graph.addNode(
      createInputNode('input1', { inputKey: 'input1', defaultValue: 'def' })
    );
    graph.addNode(
      createTextNode('txt', {
        config: { text: 'def' },
        inputs: { default: 'string' },
      })
    );
    graph.createEdge({
      id: '1',
      fromId: 'input1',
      toId: 'txt',
    });
    const res = await graph.executeNode(
      'txt',
      createCtx({
        apiInput: {
          input1: { type: 'string', value: 'one' },
        },
      })
    );
    expect(res).toEqual({
      default: { value: 'one', type: 'string' },
    });
  });

  test('double input target node', async () => {
    const graph = new LangGraph();
    graph.addNode(
      createTextNode('last', {
        inputs: { default: 'string', in2: 'string' },
        config: { text: '' },
      })
    );
    graph.addNode(
      createInputNode('input1', { inputKey: 'input1', defaultValue: 'def' })
    );
    graph.addNode(
      createInputNode('input2', { inputKey: 'input2', defaultValue: 'def2' })
    );
    graph.createEdge({
      id: '1',
      fromId: 'input1',
      toId: 'last',
    });
    graph.createEdge({
      id: '2',
      fromId: 'input2',
      toId: 'last',
      toPort: 'in2',
    });
    const res = await graph.executeNode(
      'last',
      createCtx({
        apiInput: {
          input1: { type: 'string', value: 'one and {in2}' },
          input2: { type: 'string', value: 'two' },
        },
      })
    );
    expect(res).toEqual({
      default: { type: 'string', value: 'one and two' },
    });
  });

  test('prompt with input', async () => {
    langchainMock.mockResolvedValueOnce({
      generations: [[{ text: 'me smart machine' }]],
    });
    const graph = new LangGraph();
    graph.addNode(
      createTextNode('last', {
        config: { text: '' },
      })
    );
    graph.addNode(
      createInputNode('in', { inputKey: 'foo', defaultValue: 'def foo' })
    );
    graph.addNode(
      createTextNode('t', {
        inputs: { the_input: 'string' },
        config: { text: 'some text ({the_input})' },
      })
    );
    graph.addNode(
      createLlmNode('llm', {
        config: { model: 'foo' },
      })
    );
    graph.createEdge({
      id: 'lkj',
      fromId: 'in',
      toId: 't',
      toPort: 'the_input',
    });
    graph.createEdge({
      id: ':lkj',
      fromId: 't',
      toId: 'llm',
    });
    graph.createEdge({
      id: 'lmkj',
      fromId: 'llm',
      toId: 'last',
    });
    const resp = await graph.executeNode(
      'last',
      createCtx({
        openaiApiKey: 'foo',
      })
    );
    expect(langchainMock).toHaveBeenCalledTimes(1);
    expect(langchainMock).toHaveBeenCalledWith('llms/OpenAI/generate', {
      args: { openai_api_key: 'foo' },
      func: ['some text (def foo)'],
    });
    expect(resp).toEqual({
      default: { type: 'string', value: 'me smart machine' },
    });
  });
});
