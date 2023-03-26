import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './RepeatNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class RepeatNode extends BlueprintNode {
  currentCount: number;

  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
    this.currentCount = 0;
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const maxCount = ctx.input<number>('count');
    console.log({ currentCount: this.currentCount, max: maxCount });
    if (this.currentCount < maxCount) {
      this.currentCount++;
      ctx.triggerPulse('body');
      ctx.output('current', this.currentCount);
      ctx.continue(this.execute);
    } else {
      this.currentCount = 0;
      ctx.triggerPulse('done');
      ctx.done();
    }
  }
}
