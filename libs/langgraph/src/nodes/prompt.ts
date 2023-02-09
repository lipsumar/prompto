import invariant from 'tiny-invariant';
import LangNode from '../core/LangNode';
import { langchain } from '../langchain';

export type PromptNodeOptions = {
  text: string;
};

export default function createPromptNode(
  id: string,
  { text }: PromptNodeOptions
) {
  return new LangNode({
    id,
    async execute(_, ctx) {
      invariant(ctx.openaiApiKey, 'openai api key is required');

      const resp = await langchain('llms/OpenAI/generate', {
        args: {
          openai_api_key: ctx.openaiApiKey,
        },
        func: [text],
      });

      return {
        default: { type: 'string', value: resp.generations[0][0].text },
      };
    },
    outputs: { default: 'string' },
  });
}
