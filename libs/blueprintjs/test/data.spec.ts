import ExecutionEngine, { ExecutionContext } from '../src/ExecutionEngine';
import BlueprintGraph from '../src/Graph';
import BlueprintNode from '../src/Node';

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

class DummyTextNode extends BlueprintNode {
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
    this.registerDataOutput({
      key: 'text',
      dataType: 'string',
      isArray: false,
    });
  }

  execute(ctx: ExecutionContext): void {
    ctx.output('text', this.text);
    ctx.done();
  }
}

class DummyGptNode extends BlueprintNode {
  constructor() {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('done');

    this.registerDataInput({
      key: 'prompt',
      dataType: 'string',
      isArray: false,
    });
    this.registerDataOutput({
      key: 'completion',
      dataType: 'string',
      isArray: false,
    });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const prompt = ctx.input<string>('prompt');
    console.log('gpt got prompt=', prompt);
    const completion = await this.fakeCompletion(prompt);
    ctx.output('completion', completion);
    ctx.triggerPulse('done');
    ctx.done();
  }

  async fakeCompletion(prompt: string) {
    return prompt + ' -> me smart machine';
  }
}

test('a.done->b.exec', async () => {
  const graph = new BlueprintGraph();

  graph.addNode('fn', new DummyNode(jest.fn()));
  graph.addNode('txt', new DummyTextNode('this is prompt'));
  graph.addNode('gpt', new DummyGptNode());
  graph.createEdge({
    from: 'fn.done',
    to: 'gpt.exec',
  });
  graph.createEdge({
    from: 'txt.text',
    to: 'gpt.prompt',
  });

  const engine = new ExecutionEngine(graph);
  await engine.startExecution('fn');

  console.log(engine.nodeOutputs);
});
