import LangNode from '../core/LangNode';

type QueryEmbeddingOptions = {
  id: string;
};

export function createQueryEmbedding({ id }: QueryEmbeddingOptions) {
  return new LangNode({
    id,
    async execute(inputs) {
      // langchain({
      //   call: 'embed_query',
      //   using: 'OpenAIEmbeddings',
      //   text: inputs.default.value,
      // });
      return { default: { type: 'string', value: 'iluh' } };
    },
    inputs: {
      default: 'string',
    },
  });
}
