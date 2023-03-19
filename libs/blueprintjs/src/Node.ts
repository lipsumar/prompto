import invariant from 'tiny-invariant';
import { ExecutionContext } from './ExecutionEngine';

type BlueprintPort = {
  key: string;
  value: undefined | any;
};

type Signal = {
  key: string;
};

// declare interface BlueprintNode {
//   on(event: 'signal:input', listener: (signal: Signal) => void): this;
//   on(event: 'signal:output', listener: (signal: Signal) => void): this;

//   emit(event: 'signal:input', signal: Signal): boolean;
//   emit(event: 'signal:output', signal: Signal): boolean;
// }

class BlueprintNode {
  flowInputs: string[] = [];
  flowInputsCallbacks: Record<string, Function> = {};
  flowOutputs: string[] = [];
  inputPorts: BlueprintPort[] = [];
  outputPorts: BlueprintPort[] = [];

  execute(ctx: ExecutionContext): void {
    throw new Error('Method not implemented.');
  }

  registerInputSignal(key: string, callback: Function) {
    this.flowInputs.push(key);
    this.flowInputsCallbacks[key] = callback;
  }

  registerOutputSignal(key: string) {
    this.flowOutputs.push(key);
  }

  triggerPulse(key: string, ctx: ExecutionContext) {
    const callback = this.flowInputsCallbacks[key];
    invariant(callback, `no callback found for pulse "${key}"`);
    callback.call(this, ctx);
  }

  hasOutputKey(key: string) {
    if (this.flowOutputs.includes(key)) {
      return true;
    }
    return false;
  }

  hasInputKey(key: string) {
    if (this.flowInputs.includes(key)) {
      return true;
    }
    return false;
  }
}

export default BlueprintNode;
