import invariant from 'tiny-invariant';
import BlueprintGraph from './Graph';
import { uniq, uniqBy } from 'lodash';

export type ExecutionContext = {
  triggerPulse: (key: string) => void;
  done: () => void;
  continue: (callback: Function) => void;
  input: <T>(key: string) => T;
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

export default class ExecutionEngine {
  graph: BlueprintGraph;
  head: string | null = null;
  pulseQueue: Pulse[] = [];
  executionDoneCallback: (() => void) | null = null;
  nodeStates: Map<string, NodeState> = new Map();
  nodeContinueCallbacks: Map<string, Function> = new Map();
  nodeOutputs: Map<string, any> = new Map();
  stack: Frame[] = [];
  env: Record<string, string>;

  constructor(graph: BlueprintGraph, env: Record<string, string>) {
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

    const node = this.graph.getNode(nodeId);
    const ctx = this.createExecutionContext(nodeId, frame);
    this.nodeStates.set(nodeId, 'running');
    node.execute(ctx);
    this.handlePulseQueue(); // start "event loop"
    return new Promise<void>((resolve) => {
      this.executionDoneCallback = resolve;
    });
  }

  createExecutionContext(nodeId: string, frame?: Frame): ExecutionContext {
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
        return this.getDataForInput(nodeId, key) as T;
      },
      output: <T>(key: string, value: T) => {
        const output = this.nodeOutputs.get(nodeId) || {};
        output[key] = value;
        this.nodeOutputs.set(nodeId, output);
      },
      env: (key: string) => {
        return this.env[key];
      },
    };
  }

  handlePulseQueue() {
    const outgoingPulse = this.pulseQueue.shift();

    if (!outgoingPulse && this.allNodesIdle()) {
      invariant(this.executionDoneCallback);
      this.executionDoneCallback();
      return;
    }
    // console.log('still work to do', {
    //   pulse: !outgoingPulse,
    //   allIdle: this.allNodesIdle(),
    //   statuses: this.nodeStates,
    // });
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

    setTimeout(this.handlePulseQueue.bind(this), 0);
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
    node.triggerPulse(pulse.key, ctx);
  }

  getDataForInput(nodeId: string, inputKey: string) {
    console.log('getDataForInput', { nodeId, inputKey });
    const edges = this.graph.findEdges({ toId: nodeId, toKey: inputKey });
    if (edges.length !== 1) {
      throw new Error(
        `Expected to find exactly 1 node on ${nodeId}.${inputKey} but found ${edges.length}`
      );
    }
    const edge = edges[0];

    this.computeNodeOutputs(edge.fromId);
    const ret = this.nodeOutputs.get(edge.fromId)![edge.fromKey];
    console.log('getDataForInput return', ret);
    return ret;
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
