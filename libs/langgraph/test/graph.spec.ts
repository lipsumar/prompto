import LangGraph from '../src/core/LangGraph';
import LangNode from '../src/core/LangNode';
import createInputNode from '../src/nodes/input';
import createPromptNode from '../src/nodes/prompt';
import createTargetNode from '../src/nodes/target';

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
    graph.addNode(createInputNode({ id: 'input1', inputKey: 'input1' }));
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
    graph.addNode(createInputNode({ id: 'input1', inputKey: 'input1' }));
    graph.addNode(createInputNode({ id: 'input2', inputKey: 'input2' }));
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
  test.only('query store', async () => {
    const graph = new LangGraph();
    //graph.addNode(createInputNode('q'));
    graph.addNode(
      createPromptNode({
        id: 'p',
        text: 'how do you feel, having to go to the doctor?',
      })
    );
    graph.createEdge({
      id: 'mlkj',
      fromId: 'p',
      toId: '_target',
    });
    const resp = await graph.execute({
      apiInput: {},
      openaiApiKey: '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',
    });
    console.log(resp);
  });
});
