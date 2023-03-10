import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';

export type RepeatNodeOptions = {
  maxIteration: number;
};

export default function createRepeatNode(
  id: string,
  { config }: { config: RepeatNodeOptions }
) {
  let currentIteration = 0;
  let endReached = false;
  return new LangNode({
    id,
    type: 'loop',
    async execute(inputs, ctx) {
      currentIteration++;
      if (currentIteration >= config.maxIteration) {
        endReached = true;
      }
      return {
        default: inputs.default,
      };
    },
    outputs: { default: 'string' },
    inputs: { default: 'string' },
    getInternalState() {
      return { currentIteration, endReached };
    },
  });
}
