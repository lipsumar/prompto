import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { dalle } from '../openai-utils';

export type ImageGeneratorNodeOptions = {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
};

export default function createImageGeneratorNode(
  id: string,
  {
    config,
  }: {
    config: ImageGeneratorNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(ctx.openaiApiKey, 'openai api key is required');
      const prompt = inputs.default.value;

      const resp = await dalle(
        { prompt, ...config, response_format: 'url' },
        ctx.openaiApiKey
      );
      invariant(resp.data[0].url, 'no url returned');

      return {
        default: { type: 'image', value: resp.data[0].url },
      };
    },
    inputs: { default: 'string' },
    outputs: { default: 'image' },
  });
}
