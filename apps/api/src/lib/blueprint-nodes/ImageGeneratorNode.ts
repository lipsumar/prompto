import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './ImageGeneratorNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';
import { dalle } from '../openai-utils';

export class ImageGeneratorNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const prompt = ctx.input<string>('prompt');
    const resp = await dalle(
      { prompt, response_format: 'url' },
      ctx.env('openaiApiKey')
    );
    ctx.output('image', resp.data[0].url);
    ctx.triggerPulse('done');
    ctx.done();
  }
}
