import invariant from 'tiny-invariant';
import { ExecutionContext } from './ExecutionEngine';

export type DataType = 'string' | 'number';

export type BlueprintPort = {
  key: string;
  dataType: DataType;
  isArray: boolean;
};

class BlueprintNode {
  flowInputs: string[] = [];
  flowInputsCallbacks: Record<string, Function> = {};
  flowOutputs: string[] = [];
  dataInputs: BlueprintPort[] = [];
  dataOutputs: BlueprintPort[] = [];

  execute(ctx: ExecutionContext): void {
    throw new Error('Method not implemented.');
  }

  registerInputSignal(key: string, callback: (ctx: ExecutionContext) => void) {
    this.flowInputs.push(key);
    this.flowInputsCallbacks[key] = callback;
  }

  registerOutputSignal(key: string) {
    this.flowOutputs.push(key);
  }

  registerDataInput(port: BlueprintPort) {
    this.dataInputs.push(port);
  }
  registerDataOutput(port: BlueprintPort) {
    this.dataOutputs.push(port);
  }

  isDataNode() {
    return this.flowInputs.length === 0 && this.flowOutputs.length === 0;
  }

  triggerPulse(key: string, ctx: ExecutionContext) {
    const callback = this.flowInputsCallbacks[key];
    invariant(callback, `no callback found for pulse "${key}"`);
    callback.call(this, ctx);
  }

  hasOutputKey(key: string) {
    const allOutputKeys = [
      ...this.flowOutputs,
      ...this.dataOutputs.map((port) => port.key),
    ];
    return allOutputKeys.includes(key);
  }

  hasInputKey(key: string) {
    const allInputKeys = [
      ...this.flowInputs,
      ...this.dataInputs.map((port) => port.key),
    ];
    return allInputKeys.includes(key);
  }

  toJSON() {
    return {
      flowInputs: [...this.flowInputs],
      flowOutputs: [...this.flowOutputs],
    };
  }
}

export default BlueprintNode;
