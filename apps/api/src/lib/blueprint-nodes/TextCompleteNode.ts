import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import { gpt3Complete } from '../gpt3';
import schema from './TextCompleteNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';

export class TextCompleteNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const prompt = ctx.input<string>('prompt');

    const completion = await gpt3Complete(prompt, ctx.env('openaiApiKey'), {
      temperature: ctx.input('temperature'),
      model: ctx.input('model'),
    });
    ctx.output('text', completion);

    ctx.triggerPulse('done');
    ctx.done();
  }

  // toJSON(){
  //   return {
  //     ...BlueprintNode.prototype.toJSON.call(this),
  //     type:
  //   }
  // }
}
