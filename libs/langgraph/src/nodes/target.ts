import { LangDataType } from '../types';
import LangNode from '../core/LangNode';

type TargetNodeOptions = {
  inputs: Record<string, LangDataType>;
};

export default function createTargetNode({ inputs }: TargetNodeOptions) {
  return new LangNode({
    id: '_target',
    async execute(inputs) {
      return inputs;
    },
    inputs,
  });
}
