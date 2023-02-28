import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { langchain } from '../langchain';
import { ExecuteFunctionInputs, LangDataObject, LangDataType } from '../types';

export type LlmNodeOptions = {
  model: string;
  temperature?: number;
};

export default function createLlmNode(
  id: string,
  {
    config,
  }: {
    config: LlmNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      invariant(ctx.openaiApiKey, 'openai api key is required');

      const resp = await langchain('llms/OpenAI/generate', {
        args: {
          openai_api_key: ctx.openaiApiKey,
          temperature: config.temperature,
        },
        func: [inputs.default.value],
      });

      return {
        default: { type: 'string', value: resp.generations[0][0].text },
      };
    },
    outputs: { default: 'string' },
    inputs: { default: 'string' },
  });
}
