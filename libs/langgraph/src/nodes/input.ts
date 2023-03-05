import LangNode from '../core/LangNode';

export type InputNodeOptions = {
  inputKey: string;
  defaultValue: string;
};

export default function createInputNode(id: string, options: InputNodeOptions) {
  const { inputKey, defaultValue } = options;
  return new LangNode({
    id,
    async execute(_, ctx) {
      return {
        default: ctx.apiInput[inputKey] || {
          type: 'string',
          value: defaultValue,
        },
      };
    },
    outputs: { default: 'string' },
  });
}
