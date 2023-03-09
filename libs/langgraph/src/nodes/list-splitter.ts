import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { ExecuteFunctionInputs, LangDataType } from '../types';

export default function createListSplitterNode(id: string) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(inputs.default.type === 'string');
      const text = inputs.default.value;
      const list = textToArray(text.trim());
      return {
        default: { type: 'list', value: list },
      };
    },
    outputs: { default: 'list' },
    inputs: { default: 'string' as const },
  });
}

function textToArray(text: string) {
  // Split the text by line breaks and remove any empty lines
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  // Remove any leading list markers and whitespace from each line
  const items = lines.map((line) => line.replace(/^\s*(?:-|\d+\.)\s*/, ''));

  return items;
}
