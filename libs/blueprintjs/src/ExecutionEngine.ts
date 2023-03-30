import invariant from 'tiny-invariant';
import BlueprintGraph from './Graph';
import { uniq, uniqBy } from 'lodash';
import EventEmitter from 'events';
import { DataType } from './Node';

export type ExecutionContext = {
  triggerPulse: (key: string) => void;
  done: () => void;
  error: (err: unknown) => void;
  continue: (callback: Function) => void;
  input: <T>(key: string) => T;
  inputs: () => Record<string, { type: DataType; value: any }>;
  output: <T>(key: string, value: T) => void;
  env: (key: string) => string;
};

type Pulse = {
  nodeId: string;
  key: string;
  frame: Frame;
};
type Frame = {
  nodeId: string;
  children: Frame[];
  parent: Frame | null;
};

type NodeState = 'idle' | 'running' | 'blocked' | 'to-continue';

export default class ExecutionEngine extends EventEmitter {
  graph: BlueprintGraph;
  head: string | null = null;
  pulseQueue: Pulse[] = [];
  executionDoneCallback: (() => void) | null = null;
  executionErrorCallback: ((err: unknown) => void) | null = null;
  nodeStates: Map<string, NodeState> = new Map();
  nodeContinueCallbacks: Map<string, Function> = new Map();
  nodeOutputs: Map<string, any> = new Map();
  nodeErrors: Map<string, any> = new Map();
  stack: Frame[] = [];
  env: Record<string, string>;
  stopExecution = false;

  constructor(graph: BlueprintGraph, env: Record<string, string> = {}) {
    super();
    this.graph = graph;
    this.env = env;
  }

  async startExecution(nodeId: string) {
    this.head = nodeId;
    this.pulseQueue = [];

    const frame = {
      nodeId,
      children: [],
      parent: null,
    };
    this.stack.push(frame);

    const promise = new Promise<void>((resolve, reject) => {
      this.executionDoneCallback = resolve;
      this.executionErrorCallback = reject;
    });

    const node = this.graph.getNode(nodeId);
    const ctx = this.createExecutionContext(nodeId, frame);
    this.nodeStates.set(nodeId, 'running');
    node.execute(ctx);
    this.handlePulseQueue(); // start "event loop"

    return promise;
  }

  createExecutionContext(nodeId: string, frame?: Frame): ExecutionContext {
    // collect all inputs
    const inputs = this.graph.getNode(nodeId).dataInputs.reduce((acc, port) => {
      const wrapped = this.getDataForInput(nodeId, port.key);
      acc[port.key] = {
        value: wrapped.value,
        type: wrapped.dataType,
      };
      return acc;
    }, {} as Record<string, { type: DataType; value: any }>);
    return {
      triggerPulse: (key: string) => {
        invariant(frame);
        this.pulseQueue.push({ nodeId, key, frame });
      },
      done: () => {
        this.nodeStates.set(nodeId, 'blocked');
      },
      continue: (callback: Function) => {
        this.nodeContinueCallbacks.set(nodeId, callback);
        this.nodeStates.set(nodeId, 'to-continue');
      },
      input: <T>(key: string): T => {
        const wrapped = this.getDataForInput(nodeId, key);
        console.log('input', key, wrapped);
        this.emit('node-input', {
          nodeId,
          key,
          value: wrapped.value,
          dataType: wrapped.dataType,
        });
        return wrapped.value as T;
      },
      inputs: () => {
        return inputs;
      },
      output: <T>(key: string, value: T) => {
        const output = this.nodeOutputs.get(nodeId) || {};
        output[key] = value;
        this.nodeOutputs.set(nodeId, output);
      },
      env: (key: string) => {
        return this.env[key];
      },
      error: (err: unknown) => {
        this.onError(err, nodeId);
      },
    };
  }

  handlePulseQueue() {
    if (this.stopExecution) {
      return;
    }
    const outgoingPulse = this.pulseQueue.shift();

    if (!outgoingPulse && this.allNodesIdle()) {
      invariant(this.executionDoneCallback);
      this.executionDoneCallback();
      return;
    }

    if (outgoingPulse) {
      const edges = this.graph.findEdges({
        fromId: outgoingPulse.nodeId,
        fromKey: outgoingPulse.key,
      });

      if (edges.length > 0) {
        // continue adding to the stack
        edges.forEach((edge) => {
          const frame = {
            nodeId: edge.toId,
            children: [],
            parent: outgoingPulse.frame,
          };
          outgoingPulse.frame.children.push(frame);
          const pulse = { nodeId: edge.toId, key: edge.toKey, frame };
          this.dispatchPulse(pulse);
        });
      } else {
        // end of flow, rewind stack
        this.rewindStack(outgoingPulse.frame);
      }
    }

    setTimeout(this.handlePulseQueue.bind(this), 500);
  }

  rewindStack(frame: Frame) {
    // here we can ask outgoingPulse.frame.nodeId if it needs to execute again
    if (this.nodeStates.get(frame.nodeId) === 'to-continue') {
      const callback = this.nodeContinueCallbacks.get(frame.nodeId);
      invariant(callback);
      const ctx = this.createExecutionContext(frame.nodeId, frame);
      this.nodeStates.set(frame.nodeId, 'running');
      callback.call(this.graph.getNode(frame.nodeId), ctx);
      return;
    }

    this.nodeStates.set(frame.nodeId, 'idle');
    if (frame.parent) {
      frame.parent.children = frame.parent.children.filter(
        (f) => f.nodeId !== frame.nodeId
      );
      if (frame.parent.children.length > 0) {
        return;
      }
      this.rewindStack(frame.parent);
    }
  }

  dispatchPulse(pulse: Pulse) {
    const ctx = this.createExecutionContext(pulse.nodeId, pulse.frame);
    const node = this.graph.getNode(pulse.nodeId);
    this.nodeStates.set(pulse.nodeId, 'running');
    this.emit('pulse', { nodeId: pulse.nodeId });
    node.triggerPulse(pulse.key, ctx);
  }

  onError(err: unknown, nodeId: string) {
    this.stopExecution = true;
    invariant(this.executionErrorCallback);
    this.executionErrorCallback(new ExecutionError({ nodeId, cause: err }));
  }

  getDataForInput(
    nodeId: string,
    inputKey: string
  ): { value: any; dataType: DataType } {
    console.log('getDataForInput', { nodeId, inputKey });

    const node = this.graph.getNode(nodeId);
    const inputPort = node.dataInputs.find((p) => p.key === inputKey)!;
    if (node.selfInputs[inputKey]) {
      return { value: node.selfInputs[inputKey], dataType: inputPort.dataType };
    }

    const edges = this.graph.findEdges({ toId: nodeId, toKey: inputKey });
    if (edges.length !== 1) {
      invariant(this.executionErrorCallback);
      this.executionErrorCallback(
        new Error(
          `Expected to find exactly 1 node on ${nodeId}.${inputKey} but found ${edges.length}`
        )
      );
      return { value: null, dataType: 'object' }; //@todo cleanup
    }
    const edge = edges[0];

    const dataType = this.graph
      .getNode(edge.fromId)
      .dataOutputs.find((p) => p.key === edge.fromKey)!.dataType;

    this.computeNodeOutputs(edge.fromId);
    const ret = this.nodeOutputs.get(edge.fromId)![edge.fromKey];
    console.log('getDataForInput return', ret);
    return { value: ret, dataType };
  }

  computeNodeOutputs(nodeId: string) {
    console.log('computeNodeOutputs', { nodeId });
    const node = this.graph.getNode(nodeId);
    if (node.isDataNode()) {
      const inputNodeIds = this.graph.getInputNodesOf(nodeId);
      const uniqueNodeIds = uniq(inputNodeIds);
      uniqueNodeIds.forEach((inputNodeId) =>
        this.computeNodeOutputs(inputNodeId)
      );

      const ctx = this.createExecutionContext(nodeId);
      node.execute(ctx);
      this.nodeStates.set(nodeId, 'idle');
    }
  }

  allNodesIdle() {
    return [...this.nodeStates.values()].every((status) => status === 'idle');
  }

  // async executeNode(nodeId: string) {
  //   const node = this.graph.getNode(nodeId);
  //   await node.execute(); // and now the fun begins
  // }
}

export class ExecutionError extends Error {
  nodeId: string;
  cause: unknown;

  constructor({ nodeId, cause }: { nodeId: string; cause: unknown }) {
    super('Execution error');
    this.nodeId = nodeId;
    this.cause = cause;
  }

  toJSON() {
    const cause =
      this.cause instanceof Error
        ? { message: this.cause.message, stack: this.cause.stack }
        : `${this.cause}`;
    return {
      message: 'Execution error',
      nodeId: this.nodeId,
      cause,
    };
  }
}
