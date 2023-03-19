import invariant from 'tiny-invariant';
import BlueprintGraph from './Graph';

export type ExecutionContext = {
  triggerPulse: (key: string) => void;
  done: () => void;
  continue: (callback: Function) => void;
};

type Pulse = {
  nodeId: string;
  key: string;
  frame: any;
};

type NodeState = 'idle' | 'running' | 'blocked' | 'to-continue';

export default class ExecutionEngine {
  graph: BlueprintGraph;
  head: string | null = null;
  pulseQueue: Pulse[] = [];
  executionDoneCallback: (() => void) | null = null;
  nodeStates: Map<string, NodeState> = new Map();
  nodeContinueCallbacks: Map<string, Function> = new Map();
  stack: any[] = [];

  constructor(graph: BlueprintGraph) {
    this.graph = graph;
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

  createExecutionContext(nodeId: string, frame: any) {
    return {
      triggerPulse: (key: string) => {
        this.pulseQueue.push({ nodeId, key, frame });
      },
      done: () => {
        this.nodeStates.set(nodeId, 'blocked');
      },
      continue: (callback: Function) => {
        this.nodeContinueCallbacks.set(nodeId, callback);
        this.nodeStates.set(nodeId, 'to-continue');
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

  rewindStack(frame: any) {
    // here we can ask outgoingPulse.frame.nodeId if it needs to execute again
    if (this.nodeStates.get(frame.nodeId) === 'to-continue') {
      const callback = this.nodeContinueCallbacks.get(frame.nodeId);
      invariant(callback);
      const ctx = this.createExecutionContext(frame.nodeId, frame);
      this.nodeStates.set(frame.nodeId, 'running');
      callback.call(this.graph.getNode(frame.nodeId), ctx);

      // this is a call that doesn't go through the event loop
      // no me gusta
      return;
    }

    this.nodeStates.set(frame.nodeId, 'idle');
    if (frame.parent) {
      frame.parent.children = frame.parent.children.filter(
        (c: any) => c.nodeId !== frame.nodeId
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

  allNodesIdle() {
    return [...this.nodeStates.values()].every((status) => status === 'idle');
  }

  // async executeNode(nodeId: string) {
  //   const node = this.graph.getNode(nodeId);
  //   await node.execute(); // and now the fun begins
  // }
}
