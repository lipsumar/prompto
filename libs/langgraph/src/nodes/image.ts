import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';

export type ImageNodeOptions = {
  image: string;
};

export default function createImageNode(
  id: string,
  {
    config,
  }: {
    config: ImageNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(inputs.default.type === 'image');
      const image = inputs.default?.value || config.image;

      return {
        default: { type: 'image', value: image },
      };
    },
    inputs: { default: 'image' as const },
    outputs: { default: 'image' },
  });
}
