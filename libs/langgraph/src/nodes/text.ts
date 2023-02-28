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
    inputs: Record<string, LangDataType>;
    config: TextNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      const replacedText = replaceInputsInText(inputs, config.text);

      return {
        default: { type: 'string', value: replacedText },
      };
    },
    outputs: { default: 'string' },
    inputs,
  });
}

function replaceInputsInText(
  inputs: ExecuteFunctionInputs,
  text: string
): string {
  let replaced = text;
  for (const input in inputs) {
    replaced = replaced.split(`{${input}}`).join(inputs[input].value);
  }
  return replaced;
}
