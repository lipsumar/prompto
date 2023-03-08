import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { ExecuteFunctionInputs, LangDataType } from '../types';

export default function createListSplitterNode(id: string) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(inputs.default.type === 'string');
      const text = inputs.default.value;
      const list = formatListToListOfStrings(text.trim());
      return {
        default: { type: 'list', value: list },
      };
    },
    outputs: { default: 'list' },
    inputs: { default: 'string' as const },
  });
}

function formatListToListOfStrings(str: string) {
  const lines = str.split('\n');
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('- ')) {
      output.push(line.substring(2));
    }
  }

  return output;
}
