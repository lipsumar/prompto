import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { ExecuteFunctionInputs, LangDataType } from '../types';

export type TextNodeOptions = {
  text: string;
  something?: boolean;
};

export default function createTextNode(
  id: string,
  {
    inputs,
    config,
  }: {
    inputs?: Record<string, LangDataType>;
    config: TextNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      let text = config.text;
      if (inputs.default && inputs.default.type === 'string') {
        text = inputs.default.value;
      }
      //const text = inputs.default?.value || config.text;
      const replacedText = replaceInputsInText(inputs, text);

      return {
        default: { type: 'string', value: replacedText },
      };
    },
    outputs: { default: 'string' },
    inputs: { ...inputs, default: 'string' as const },
  });
}

function replaceInputsInText(
  inputs: ExecuteFunctionInputs,
  text: string
): string {
  let replaced = text;
  for (const input in inputs) {
    const currentInput = inputs[input];
    invariant(currentInput.type === 'string');
    replaced = replaced.split(`{${input}}`).join(currentInput.value);
  }
  return replaced;
}
