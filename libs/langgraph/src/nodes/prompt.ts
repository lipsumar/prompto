import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { langchain } from '../langchain';
import { ExecuteFunctionInputs, LangDataObject, LangDataType } from '../types';

export type PromptNodeOptions = {
  text: string;
};

export default function createPromptNode(
  id: string,
  {
    inputs,
    config,
  }: {
    inputs: Record<string, LangDataType>;
    config: PromptNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(ctx.openaiApiKey, 'openai api key is required');

      const replacedText = replaceInputsInText(inputs, config.text);

      const resp = await langchain('llms/OpenAI/generate', {
        args: {
          openai_api_key: ctx.openaiApiKey,
        },
        func: [replacedText],
      });

      return {
        default: { type: 'string', value: resp.generations[0][0].text },
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
