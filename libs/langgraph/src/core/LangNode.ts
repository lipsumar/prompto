import type { ExecuteFunction, LangDataType } from '../types';

type NodeOptions = {
  id: string;
  execute: ExecuteFunction;
  outputs?: Record<string, LangDataType>;
  inputs?: Record<string, LangDataType>;
  type?: LangNodeType;
  getInternalState?: () => any;
};

type LangNodeType = 'regular' | 'loop';

export default class LangNode {
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
  execute: ExecuteFunction;
  id: string;
  status: 'idle' | 'executing' = 'idle';
  type: LangNodeType;
  getInternalStateFn: () => any;

  constructor(opts: NodeOptions) {
    this.id = opts.id;
    this.execute = opts.execute;
    this.inputs = opts.inputs || {};
    this.outputs = opts.outputs || {};
    this.type = opts.type || 'regular';
    this.getInternalStateFn = opts.getInternalState || (() => ({}));
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

  getInternalState() {
    return this.getInternalStateFn();
  }
}
