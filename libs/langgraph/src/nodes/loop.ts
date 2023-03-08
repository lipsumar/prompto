import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';

export default function createLoopNode(id: string) {
  let currentIndex = 0;
  let endReached = false;
  return new LangNode({
    id,
    type: 'loop',
    async execute(inputs, ctx) {
      invariant(inputs.default.type === 'list');
      const currentItem = inputs.default.value.at(currentIndex);
      if (typeof currentItem === 'undefined') {
        throw new Error('ERR_END_OF_LIST'); //@todo what do we do then?
      }
      currentIndex++;
      if (currentIndex > inputs.default.value.length - 1) {
        endReached = true;
      }
      return {
        default: { type: 'string', value: currentItem },
      };
    },
    outputs: { default: 'string' },
    inputs: { default: 'list' },
    getInternalState() {
      return { currentIndex, endReached };
    },
  });
}
