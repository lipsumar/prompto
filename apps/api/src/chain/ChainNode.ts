import ChainPort from './ChainPort';
import { ApiInput } from './types';

type ExecuteFunctionOutputs = Record<string, { type: 'string'; value: string }>;
type ExecuteFunctionInputs = Record<string, { type: 'string'; value: string }>;
type ExecuteFunction = (
  inputs: ExecuteFunctionInputs,
  opts: { apiInput: ApiInput }
) => ExecuteFunctionOutputs;
type ChainNodeOptions = {
  execute: ExecuteFunction;
  outputs?: string[];
  inputs?: string[];
};

export default class ChainNode {
  inputs: ChainPort[] = [];
  outputs: ChainPort[] = [];
  execute: ExecuteFunction;
  id: number = 0;
  status: 'idle' | 'executing' = 'idle';

  constructor(opts: ChainNodeOptions) {
    this.execute = opts.execute;
    if (opts.inputs) {
      this.inputs = opts.inputs.map((id) => new ChainPort(id));
    }
    if (opts.outputs) {
      this.outputs = opts.outputs.map((id) => new ChainPort(id));
    }
  }

  getInputPort(portId: string) {
    return this.inputs.find((p) => p.id === portId);
  }
  getOutputPort(portId: string) {
    return this.outputs.find((p) => p.id === portId);
  }

  hasInputs() {
    return this.inputs.length > 0;
  }
}
