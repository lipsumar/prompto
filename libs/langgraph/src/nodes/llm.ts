import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { langchain } from '../langchain';
import { ExecuteFunctionInputs, LangDataObject, LangDataType } from '../types';
import { completion } from '../openai-utils';

export type LlmNodeOptions = {
  model: string;
  temperature?: number;
  max_tokens?: number;
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

      const prompt = inputs.default.value;
      const resp = await completion(
        {
          prompt,
          temperature: config.temperature,
          model: config.model,
          max_tokens: config.max_tokens || 100,
        },
        ctx.openaiApiKey
      );

      return {
        default: { type: 'string', value: resp.choices[0].text || '' },
      };
    },
    outputs: { default: 'string' },
    inputs: { default: 'string' },
  });
}
