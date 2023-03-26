import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './DebugNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class DebugNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    ctx.input('text'); // we need to grab it for the executor to fire the node-input event (so FE can listen)
    ctx.triggerPulse('done');
    ctx.done();
  }
}
