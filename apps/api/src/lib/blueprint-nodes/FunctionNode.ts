import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';

import schema from './FunctionNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class FunctionNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    ctx.triggerPulse('done');
    ctx.done();
  }
}
