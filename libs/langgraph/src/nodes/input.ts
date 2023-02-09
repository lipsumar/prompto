import LangNode from '../core/LangNode';

export type InputNodeOptions = {
  inputKey: string;
};

export default function createInputNode(id: string, options: InputNodeOptions) {
  const { inputKey } = options;
  return new LangNode({
    id,
    async execute(_, ctx) {
      return { default: ctx.apiInput[inputKey] };
    },
    outputs: { default: 'string' },
  });
}
