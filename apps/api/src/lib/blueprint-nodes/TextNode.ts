import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './TextNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class TextNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const text = ctx.input<string>('text');
    ctx.output('text', text);
    ctx.done();
  }
}
