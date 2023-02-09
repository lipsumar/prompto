import type { ExecuteFunctionContext, LangDataType } from '../types';

// const someInput = {lol: 'string', trol: 'image'};
// export type InputObj = typeof someInput;

type ExecuteFunctionOutputs = Record<string, { type: 'string'; value: string }>;
//type ExecuteFunctionOutputs<InputObj, K> = { [k:K extends keyof InputObj]: { type: 'string'; value: string } };
type ExecuteFunctionInputs = Record<string, { type: 'string'; value: string }>;
type ExecuteFunction = (
  inputs: ExecuteFunctionInputs,
  ctx: ExecuteFunctionContext
) => Promise<ExecuteFunctionOutputs>;

type NodeOptions = {
  id: string;
  execute: ExecuteFunction;
  outputs?: Record<string, LangDataType>;
  inputs?: Record<string, LangDataType>;
};

export default class LangNode {
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
  execute: ExecuteFunction;
  id: string;
  status: 'idle' | 'executing' = 'idle';

  constructor(opts: NodeOptions) {
    this.id = opts.id;
    this.execute = opts.execute;
    this.inputs = opts.inputs || {};
    this.outputs = opts.outputs || {};
  }

  hasInputPort(portId: string) {
    return typeof this.inputs[portId] !== 'undefined';
  }
  hasOutputPort(portId: string) {
    return typeof this.outputs[portId] !== 'undefined';
  }

  hasInputs() {
    return Object.keys(this.inputs).length > 0;
  }
}
