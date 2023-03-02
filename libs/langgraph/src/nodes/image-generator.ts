import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';

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

      const url = await dalle({ prompt, ...config });

      return {
        default: { type: 'image', value: url },
      };
    },
    inputs: { default: 'string' },
    outputs: { default: 'image' },
  });
}

function dalle({}: any): string {
  return 'https://openailabsprodscus.blob.core.windows.net/private/user-keXZDRtc79N3r9ScPT1uptMD/generations/generation-K0N7IhIBKLsLvZlJQ82LFNcl/image.webp?st=2023-03-02T09%3A50%3A31Z&se=2023-03-02T11%3A48%3A31Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/webp&skoid=15f0b47b-a152-4599-9e98-9cb4a58269f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-03-02T06%3A10%3A22Z&ske=2023-03-09T06%3A10%3A22Z&sks=b&skv=2021-08-06&sig=qHbOcQw8bjKijHZ/XE3w1D2gmXhLun93QYH66WSbNCI%3D';
}
