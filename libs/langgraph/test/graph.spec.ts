import LangGraph from '../src/core/LangGraph';
import LangNode from '../src/core/LangNode';
import { langchain } from '../src/langchain';
import createInputNode from '../src/nodes/input';
import createLlmNode from '../src/nodes/llm';
import createTargetNode from '../src/nodes/target';
import createTextNode from '../src/nodes/text';

jest.mock('../src/langchain');
const langchainMock = langchain as jest.MockedFunction<typeof langchain>;

describe('graph', () => {
  test('node -> target', async () => {
    const promptNode = new LangNode({
      id: 'prompt',
      async execute(inputs, opts) {
        return { default: { value: 'the prompt result', type: 'string' } };
      },
      outputs: { default: 'string' },
    });
    const graph = new LangGraph();
    graph.addNode(promptNode);
    graph.createEdge({
      id: '1',
      fromId: 'prompt',
      toId: '_target',
    });
    const res = await graph.execute({ apiInput: {} });
    expect(res).toEqual({
      default: { value: 'the prompt result', type: 'string' },
    });
  });

  test('input node', async () => {
    const graph = new LangGraph();
    graph.addNode(
      createInputNode('input1', { inputKey: 'input1', defaultValue: 'def' })
    );
    graph.createEdge({
      id: '1',
      fromId: 'input1',
      toId: '_target',
    });
    const res = await graph.execute({
      apiInput: {
        input1: { type: 'string', value: 'one' },
      },
    });
    expect(res).toEqual({
      default: { value: 'one', type: 'string' },
    });
  });

  test('double input target node', async () => {
    const graph = new LangGraph();
    graph.setTargetNode(
      createTargetNode({
        inputs: {
          default: 'string',
          in2: 'string',
        },
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
      toId: '_target',
    });
    graph.createEdge({
      id: '2',
      fromId: 'input2',
      toId: '_target',
      toPort: 'in2',
    });
    const res = await graph.execute({
      apiInput: {
        input1: { type: 'string', value: 'one' },
        input2: { type: 'string', value: 'two' },
      },
    });
    expect(res).toEqual({
      default: { type: 'string', value: 'one' },
      in2: { type: 'string', value: 'two' },
    });
  });
  test('prompt with input', async () => {
    langchainMock.mockResolvedValueOnce({
      generations: [[{ text: 'me smart machine' }]],
    });
    const graph = new LangGraph();
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
      toId: '_target',
    });
    const resp = await graph.execute({ apiInput: {}, openaiApiKey: 'foo' });
    console.log(resp);
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
