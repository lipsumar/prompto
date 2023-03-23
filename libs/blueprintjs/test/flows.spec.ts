import ExecutionEngine, { ExecutionContext } from '../src/ExecutionEngine';
import BlueprintGraph from '../src/Graph';
import BlueprintNode from '../src/Node';

function printFrame(frame: any, ident = 0) {
  process.stdout.write('--'.repeat(ident) + frame.nodeId + '\n');
  frame.children.forEach((c: any) => printFrame(c, ident + 1));
}

class DummyNode extends BlueprintNode {
  spy: Function;
  constructor(spy: Function) {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('done');
    this.spy = spy;
  }

  execute(ctx: ExecutionContext): void {
    this.spy();
    ctx.triggerPulse('done');
    ctx.done();
  }
}

class DummyAsyncNode extends BlueprintNode {
  spy: Function;
  constructor(spy: Function) {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('done');
    this.spy = spy;
  }

  execute(ctx: ExecutionContext): void {
    this.spy();
    setTimeout(() => {
      ctx.triggerPulse('done');
      ctx.done();
    }, 0);
  }
}

class DummyLoopNode extends BlueprintNode {
  spy: Function;
  maxIteration: number;
  current: number;
  constructor(spy: Function) {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('body');
    this.registerOutputSignal('done');
    this.spy = spy;
    this.maxIteration = 3;
    this.current = 0;
  }

  execute(ctx: ExecutionContext): void {
    this.spy();
    if (this.current < this.maxIteration) {
      this.current++;
      ctx.triggerPulse('body');
      ctx.continue(this.execute);
    } else {
      this.current = 0;
      ctx.triggerPulse('done');
      ctx.done();
    }
  }
}

describe('linear flow', () => {
  test('a.done->b.exec', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const bSpy = jest.fn();
    graph.addNode('a', new DummyNode(aSpy));
    graph.addNode('b', new DummyAsyncNode(bSpy));
    graph.createEdge({
      from: 'a.done',
      to: 'b.exec',
    });

    const engine = new ExecutionEngine(graph);
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(1);
  });

  test('a.done->b.exec, b.done->c.exec', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const bSpy = jest.fn();
    const cSpy = jest.fn();
    graph.addNode('a', new DummyAsyncNode(aSpy));
    graph.addNode('b', new DummyNode(bSpy));
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
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(1);
    expect(cSpy).toHaveBeenCalledTimes(1);
  });
});

describe('split flow', () => {
  test('a.done->b.exec, a.done->c.exec', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const bSpy = jest.fn();
    const cSpy = jest.fn();
    graph.addNode('a', new DummyAsyncNode(aSpy));
    graph.addNode('b', new DummyNode(bSpy));
    graph.addNode('c', new DummyAsyncNode(cSpy));

    graph.createEdge({
      from: 'a.done',
      to: 'b.exec',
    });
    graph.createEdge({
      from: 'a.done',
      to: 'c.exec',
    });

    const engine = new ExecutionEngine(graph);
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(1);
    expect(cSpy).toHaveBeenCalledTimes(1);
  });
});

describe('split & merge', () => {
  test('a.done->b.exec, a.done->c.exec, b.done->d.exec, c.done->d.exec', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const bSpy = jest.fn();
    const cSpy = jest.fn();
    const dSpy = jest.fn();
    graph.addNode('a', new DummyNode(aSpy));
    graph.addNode('b', new DummyAsyncNode(bSpy));
    graph.addNode('c', new DummyNode(cSpy));
    graph.addNode('d', new DummyAsyncNode(dSpy));

    graph.createEdge({
      from: 'a.done',
      to: 'b.exec',
    });
    graph.createEdge({
      from: 'a.done',
      to: 'c.exec',
    });
    graph.createEdge({
      from: 'b.done',
      to: 'd.exec',
    });
    graph.createEdge({
      from: 'c.done',
      to: 'd.exec',
    });

    const engine = new ExecutionEngine(graph);
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(1);
    expect(cSpy).toHaveBeenCalledTimes(1);
    expect(dSpy).toHaveBeenCalledTimes(2);
    printFrame(engine.stack[0]);
  });
});

describe('loops', () => {
  test('a.done->loop.exec, loop.body->b.exec, b.done->b2.exec loop.done->c.exec', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const loopSpy = jest.fn();
    const bSpy = jest.fn();
    const b2Spy = jest.fn();
    const cSpy = jest.fn();
    graph.addNode('a', new DummyNode(aSpy));
    graph.addNode('loop', new DummyLoopNode(loopSpy));
    graph.addNode('b', new DummyAsyncNode(bSpy));
    graph.addNode('b2', new DummyAsyncNode(b2Spy));
    graph.addNode('c', new DummyNode(cSpy));
    graph.createEdge({
      from: 'a.done',
      to: 'loop.exec',
    });
    graph.createEdge({
      from: 'loop.body',
      to: 'b.exec',
    });
    graph.createEdge({
      from: 'b.done',
      to: 'b2.exec',
    });
    graph.createEdge({
      from: 'loop.done',
      to: 'c.exec',
    });

    const engine = new ExecutionEngine(graph);
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(3);
    expect(loopSpy).toHaveBeenCalledTimes(4);
    expect(b2Spy).toHaveBeenCalledTimes(3);
    expect(cSpy).toHaveBeenCalledTimes(1);
  });

  test('nested loop', async () => {
    const graph = new BlueprintGraph();
    const aSpy = jest.fn();
    const loopSpy = jest.fn();
    const bSpy = jest.fn();
    const b2Spy = jest.fn();
    const loop2Spy = jest.fn();
    const cSpy = jest.fn();
    graph.addNode('a', new DummyNode(aSpy));
    graph.addNode('loop', new DummyLoopNode(loopSpy));
    graph.addNode('b', new DummyAsyncNode(bSpy));
    graph.addNode('loop2', new DummyLoopNode(loop2Spy));
    graph.addNode('b2', new DummyAsyncNode(b2Spy));
    graph.addNode('c', new DummyNode(cSpy));
    graph.createEdge({
      from: 'a.done',
      to: 'loop.exec',
    });
    graph.createEdge({
      from: 'loop.body',
      to: 'b.exec',
    });
    graph.createEdge({
      from: 'b.done',
      to: 'loop2.exec',
    });
    graph.createEdge({
      from: 'loop2.body',
      to: 'b2.exec',
    });
    graph.createEdge({
      from: 'loop.done',
      to: 'c.exec',
    });

    const engine = new ExecutionEngine(graph);
    await engine.startExecution('a');

    expect(aSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledTimes(3);
    expect(loopSpy).toHaveBeenCalledTimes(4);
    expect(loop2Spy).toHaveBeenCalledTimes(12);
    expect(b2Spy).toHaveBeenCalledTimes(9);
    expect(cSpy).toHaveBeenCalledTimes(1);
  });
});
