import { BlueprintNode, ExecutionContext } from '../src';

export class DummyNode extends BlueprintNode {
  spy: Function;
  throwError: boolean;
  constructor(spy: Function, throwError = false) {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('done');
    this.spy = spy;
    this.throwError = throwError;
  }

  execute(ctx: ExecutionContext): void {
    this.spy();
    if (this.throwError) {
      throw new Error('oh no!');
    }
    ctx.triggerPulse('done');
    ctx.done();
  }
}

export class DummyAsyncNode extends BlueprintNode {
  spy: Function;
  throwError: boolean;
  constructor(spy: Function, throwError = false) {
    super();
    this.registerInputSignal('exec', this.execute);
    this.registerOutputSignal('done');
    this.spy = spy;
    this.throwError = throwError;
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.spy();
      if (this.throwError) {
        throw Error('oh no!');
      }
      ctx.triggerPulse('done');
      ctx.done();
      resolve();
    });
  }
}
