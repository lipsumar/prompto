import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './ObjectNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class ObjectNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, {});
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const inputs = Object.entries(ctx.inputs()).reduce((acc, kv) => {
      acc[kv[0]] = kv[1];
      return acc;
    }, {} as Record<string, any>);
    ctx.output('object', { ...inputs });
    ctx.done();
  }
}
