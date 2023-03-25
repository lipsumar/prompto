import ExecutionEngine, { ExecutionError } from '../src/ExecutionEngine';
import BlueprintGraph from '../src/Graph';
import { DummyAsyncNode, DummyNode } from './dummyNodes';

test('Error in sync node', async () => {
  const graph = new BlueprintGraph();
  const aSpy = jest.fn();
  const bSpy = jest.fn();
  const cSpy = jest.fn();
  graph.addNode('a', new DummyAsyncNode(aSpy));
  graph.addNode('b', new DummyNode(bSpy, true));
  graph.addNode('c', new DummyNode(cSpy));
  graph.createEdge({
    from: 'a.done',
    to: 'b.exec',
  });
  graph.createEdge({
    from: 'b.done',
    to: 'c.exec',
  });

  const engine = new ExecutionEngine(graph);
  let error;
  try {
    await engine.startExecution('a');
  } catch (err) {
    error = err;
  }

  expect(aSpy).toHaveBeenCalledTimes(1);
  expect(bSpy).toHaveBeenCalledTimes(1);
  expect(cSpy).toHaveBeenCalledTimes(0);

  expect(error).toHaveProperty('message', 'Execution error');
  expect(error).toHaveProperty('nodeId', 'b');
  expect(error).toBeInstanceOf(ExecutionError);
  expect((error as ExecutionError).cause).toHaveProperty('message', 'oh no!');
});

test('Error in async node', async () => {
  const graph = new BlueprintGraph();
  const aSpy = jest.fn();
  const bSpy = jest.fn();
  const cSpy = jest.fn();
  graph.addNode('a', new DummyAsyncNode(aSpy));
  graph.addNode('b', new DummyAsyncNode(bSpy, true));
  graph.addNode('c', new DummyNode(cSpy));
  graph.createEdge({
    from: 'a.done',
    to: 'b.exec',
  });
  graph.createEdge({
    from: 'b.done',
    to: 'c.exec',
  });

  const engine = new ExecutionEngine(graph);
  let error;
  try {
    await engine.startExecution('a');
  } catch (err) {
    error = err;
  }

  expect(aSpy).toHaveBeenCalledTimes(1);
  expect(bSpy).toHaveBeenCalledTimes(1);
  expect(cSpy).toHaveBeenCalledTimes(0);

  expect(error).toHaveProperty('message', 'Execution error');
  expect(error).toHaveProperty('nodeId', 'b');
  expect(error).toBeInstanceOf(ExecutionError);
  expect((error as ExecutionError).cause).toHaveProperty('message', 'oh no!');
});
