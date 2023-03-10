import ExecutionEngine from '../src/core/ExecutionEngine';
import LangGraph from '../src/core/LangGraph';
import LangNode from '../src/core/LangNode';
import createImageGeneratorNode from '../src/nodes/image-generator';

import createInputNode from '../src/nodes/input';
import createListSplitterNode from '../src/nodes/list-splitter';
import createLlmNode from '../src/nodes/llm';
import createLoopNode from '../src/nodes/loop';
import createRepeatNode from '../src/nodes/repeat';
import createTextNode from '../src/nodes/text';
import { completion, dalle } from '../src/openai-utils';
import { createCtx } from './utils';

jest.mock('../src/openai-utils');
const completionMock = completion as jest.MockedFunction<typeof completion>;
const dalleMock = dalle as jest.MockedFunction<typeof dalle>;

const jestConsole = console;
beforeEach(() => {
  global.console = require('console');
});
afterEach(() => {
  global.console = jestConsole;
});

describe('graph', () => {
  test('single node', (done) => {
    const node = new LangNode({
      id: 'n',
      async execute(inputs, opts) {
        return { default: { value: 'the prompt result', type: 'string' } };
      },
      outputs: { default: 'string' },
    });
    const graph = new LangGraph();
    graph.addNode(node);

    const engine = new ExecutionEngine(graph);
    expect(engine.nodeStates['n'].status).toBe('ready');
    engine.on('done', () => {
      expect(engine.getNodeOutputs(node)).toEqual({
        default: { value: 'the prompt result', type: 'string' },
      });
      done();
    });
    engine.execute(createCtx());
  });

  test('input node', (done) => {
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

    const engine = new ExecutionEngine(graph);
    engine.on('done', () => {
      expect(engine.getNodeOutputs('txt')).toEqual({
        default: { value: 'one', type: 'string' },
      });
      done();
    });
    engine.execute(
      createCtx({
        apiInput: {
          input1: { type: 'string', value: 'one' },
        },
      })
    );
  });

  test('double input target node', (done) => {
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

    const engine = new ExecutionEngine(graph);
    engine.on('done', () => {
      expect(engine.getNodeOutputs('last')).toEqual({
        default: { type: 'string', value: 'one and two' },
      });
      done();
    });
    engine.execute(
      createCtx({
        apiInput: {
          input1: { type: 'string', value: 'one and {in2}' },
          input2: { type: 'string', value: 'two' },
        },
      })
    );
  });

  test('prompt with input', (done) => {
    completionMock.mockResolvedValueOnce({
      choices: [{ text: 'me smart machine' }],
    } as any);

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
        config: { model: 'foo-model', max_tokens: 99, temperature: 1 },
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

    const engine = new ExecutionEngine(graph);
    engine.once('done', () => {
      expect(completionMock).toHaveBeenCalledTimes(1);
      expect(completionMock).toHaveBeenCalledWith(
        {
          prompt: 'some text (def foo)',
          model: 'foo-model',
          max_tokens: 99,
          temperature: 1,
        },
        'foo-key'
      );
      expect(engine.getNodeOutputs('last')).toEqual({
        default: { type: 'string', value: 'me smart machine' },
      });
      done();
    });
    engine.execute(createCtx({ apiInput: {}, openaiApiKey: 'foo-key' }));
  });

  describe('lists', () => {
    test('txt -> list-splitter', (done) => {
      const graph = new LangGraph();

      graph.addNode(
        createTextNode('txt', {
          config: { text: '- item 1\n- item 2\n- item 3' },
        })
      );
      graph.addNode(createListSplitterNode('split'));
      graph.createEdge({
        id: 'kljh',
        fromId: 'txt',
        toId: 'split',
      });

      const engine = new ExecutionEngine(graph);
      engine.once('done', () => {
        expect(engine.getNodeOutputs('split')).toEqual({
          default: { type: 'list', value: ['item 1', 'item 2', 'item 3'] },
        });
        done();
      });
      engine.execute(createCtx({ apiInput: {} }));
    });

    test('txt -> list-splitter -> loop -> node', (done) => {
      const graph = new LangGraph();

      graph.addNode(
        createTextNode('txt', {
          config: { text: '- item 1\n- item 2\n- item 3' },
        })
      );
      graph.addNode(createListSplitterNode('split'));
      graph.createEdge({
        id: 'kljh',
        fromId: 'txt',
        toId: 'split',
      });

      graph.addNode(createLoopNode('loop'));
      graph.createEdge({
        id: 'lkjljljkl',
        fromId: 'split',
        toId: 'loop',
      });

      const nodeExecute = jest.fn();
      graph.addNode(
        new LangNode({
          id: 'node',
          async execute(inputs) {
            //console.log('exe', inputs);
            nodeExecute(inputs);
            return inputs;
          },
          inputs: { default: 'string' },
        })
      );
      graph.createEdge({
        id: 'lkj34ljljkl',
        fromId: 'loop',
        toId: 'node',
      });

      const engine = new ExecutionEngine(graph);
      engine.once('done', () => {
        expect(engine.getNodeOutputs('node')).toEqual({
          default: { type: 'string', value: 'item 3' },
        });
        expect(nodeExecute).toHaveBeenCalledTimes(3);
        expect(nodeExecute.mock.calls[0][0]).toEqual({
          default: { type: 'string', value: 'item 1' },
        });
        expect(nodeExecute.mock.calls[1][0]).toEqual({
          default: { type: 'string', value: 'item 2' },
        });
        expect(nodeExecute.mock.calls[2][0]).toEqual({
          default: { type: 'string', value: 'item 3' },
        });
        done();
      });
      engine.execute(createCtx({ apiInput: {} }));
    });

    test('txt -> list-splitter -> loop -> txt -> img-gen', (done) => {
      const graph = new LangGraph();

      graph.addNode(
        createTextNode('txt', {
          config: { text: '- item 1\n- item 2\n- item 3' },
        })
      );
      graph.addNode(createListSplitterNode('split'));
      graph.createEdge({
        id: 'kljh',
        fromId: 'txt',
        toId: 'split',
      });

      graph.addNode(createLoopNode('loop'));
      graph.createEdge({
        id: 'lkjljljkl',
        fromId: 'split',
        toId: 'loop',
      });

      graph.addNode(
        createTextNode('txt2', {
          config: { text: 'image of {in1}' },
          inputs: { in1: 'string' },
        })
      );
      graph.createEdge({
        id: 'lkj34ljljkl',
        fromId: 'loop',
        toId: 'txt2',
        toPort: 'in1',
      });

      dalleMock.mockImplementation(async ({ prompt }) => ({
        created: 1,
        data: [{ url: prompt }],
      }));
      graph.addNode(createImageGeneratorNode('imggen', { config: {} }));
      graph.createEdge({
        id: 'lkl',
        fromId: 'txt2',
        toId: 'imggen',
      });

      const engine = new ExecutionEngine(graph);
      engine.once('done', () => {
        expect(engine.getNodeOutputs('imggen')).toEqual({
          default: { type: 'image', value: 'image of item 3' },
        });
        done();
      });
      engine.execute(createCtx({ apiInput: {}, openaiApiKey: 'lol' }));
    });
  });

  describe('repeat', () => {
    test('txt -> repeat -> node', (done) => {
      const graph = new LangGraph();
      graph.addNode(createTextNode('txt', { config: { text: 'some text' } }));

      graph.addNode(createRepeatNode('rep', { config: { maxIteration: 3 } }));
      graph.createEdge({
        id: 'jkl',
        fromId: 'txt',
        toId: 'rep',
      });

      const nodeExecute = jest.fn();
      graph.addNode(
        new LangNode({
          id: 'node',
          async execute(inputs) {
            //console.log('exe', inputs);
            nodeExecute(inputs);
            return inputs;
          },
          inputs: { default: 'string' },
        })
      );
      graph.createEdge({
        id: 'jkjkl',
        fromId: 'rep',
        toId: 'node',
      });

      const engine = new ExecutionEngine(graph);
      engine.once('done', () => {
        expect(engine.getNodeOutputs('node')).toEqual({
          default: { type: 'string', value: 'some text' },
        });
        expect(nodeExecute).toHaveBeenCalledTimes(3);
        expect(nodeExecute.mock.calls[0][0]).toEqual({
          default: { type: 'string', value: 'some text' },
        });
        expect(nodeExecute.mock.calls[1][0]).toEqual({
          default: { type: 'string', value: 'some text' },
        });
        expect(nodeExecute.mock.calls[2][0]).toEqual({
          default: { type: 'string', value: 'some text' },
        });
        done();
      });
      engine.execute(createCtx());
    });

    test('txt -> repeat (-> nodeA) (-> nodeB)', (done) => {
      const graph = new LangGraph();
      graph.addNode(createTextNode('txt', { config: { text: 'some text' } }));

      graph.addNode(createRepeatNode('rep', { config: { maxIteration: 3 } }));
      graph.createEdge({
        id: 'jkl',
        fromId: 'txt',
        toId: 'rep',
      });

      const nodeAExecute = jest.fn();
      graph.addNode(
        new LangNode({
          id: 'nodeA',
          async execute(inputs) {
            //console.log('exe', inputs);
            nodeAExecute(inputs);
            return inputs;
          },
          inputs: { default: 'string' },
        })
      );
      graph.createEdge({
        id: 'jkjklA',
        fromId: 'rep',
        toId: 'nodeA',
      });

      const nodeBExecute = jest.fn();
      graph.addNode(
        new LangNode({
          id: 'nodeB',
          async execute(inputs) {
            //console.log('exe', inputs);
            nodeBExecute(inputs);
            return inputs;
          },
          inputs: { default: 'string' },
        })
      );
      graph.createEdge({
        id: 'jkjklB',
        fromId: 'rep',
        toId: 'nodeB',
      });

      const engine = new ExecutionEngine(graph);
      engine.once('done', () => {
        expect(engine.getNodeOutputs('nodeA')).toEqual({
          default: { type: 'string', value: 'some text' },
        });
        expect(nodeAExecute).toHaveBeenCalledTimes(3);
        expect(nodeAExecute.mock.calls).toEqual([
          [{ default: { type: 'string', value: 'some text' } }],
          [{ default: { type: 'string', value: 'some text' } }],
          [{ default: { type: 'string', value: 'some text' } }],
        ]);

        expect(nodeBExecute).toHaveBeenCalledTimes(3);
        expect(nodeBExecute.mock.calls).toEqual([
          [{ default: { type: 'string', value: 'some text' } }],
          [{ default: { type: 'string', value: 'some text' } }],
          [{ default: { type: 'string', value: 'some text' } }],
        ]);

        done();
      });
      engine.execute(createCtx());
    });
  });
});
