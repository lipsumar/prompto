import { uniqBy } from 'lodash';
import {
  ExecuteFunctionContext,
  ExecuteFunctionOutputs,
  ExecuteResults,
} from '../types';
import LangGraph from './LangGraph';
import LangNode from './LangNode';
import EventEmitter from 'events';

type NodeStatus =
  | 'awaiting' // awaiting upstream nodes to be ready
  | 'ready' // ready to execute
  | 'running' // executing
  | 'paused' // waiting for downstream nodes to be done
  | 'done' // done executing
  | 'error'
  | 'unknown';
type NodeStates = Record<
  string,
  {
    status: NodeStatus;
    inputNodes: ReturnType<LangGraph['getInputNodesOf']>;
    outputs: ExecuteFunctionOutputs;
  }
>;

export default class ExecutionEngine extends EventEmitter {
  graph: LangGraph;
  nodeStates: NodeStates;
  cancelExecution = false;
  isDone = false;
  executeResults: ExecuteResults = [];

  constructor(graph: LangGraph) {
    super();
    this.graph = graph;
    this.nodeStates = this.buildNodeStates();
  }

  async execute(ctx: ExecuteFunctionContext) {
    if (this.cancelExecution) {
      console.log('stopping execution');
      return;
    }
    if (this.isDone) {
      return;
    }

    // check if "awaiting" nodes can switched to "ready"
    // (if all upstream nodes are "done" or "paused")
    console.log('check awaiting nodes...');
    const awaitingNodes = this.findNodesWithStatus('awaiting');
    awaitingNodes.forEach((awaitingNode) => {
      const allInputNodesDone = this.nodeStates[
        awaitingNode.id
      ].inputNodes.every(({ node }) =>
        ['done', 'paused'].includes(this.getNodeStatus(node))
      );
      if (allInputNodesDone) {
        this.setNodeStatus(awaitingNode, 'ready');
      }
    });

    // check if "paused" nodes can be switched to "ready"
    // (if all sownstream nodes are "done")
    console.log('check paused nodes...');
    const pausedNodes = this.findNodesWithStatus('paused');
    pausedNodes.forEach((pausedNode) => {
      const downstreamNodes = this.graph.getDownstreamNodesOf(pausedNode);
      const allDone = downstreamNodes.every(
        (node) => this.nodeStates[node.id].status === 'done'
      );
      if (allDone) {
        this.setNodeStatus(pausedNode, 'ready');
        downstreamNodes.forEach((n) => this.setNodeStatus(n, 'awaiting'));
        // const outputNodes = this.graph.getOutputNodesOf(pausedNode);
        // outputNodes.forEach((n) => this.setNodeStatus(n.node, 'ready'));
      }
    });

    const readyNodes = this.findNodesWithStatus('ready');
    const doneNodes = this.findNodesWithStatus('done');
    if (doneNodes.length === this.graph.nodes.length) {
      //console.log('all done: graph execution is done');
      this.isDone = true;
      this.emitStep();
      this.emit('done');
    }
    readyNodes.forEach((node) => this.executeNode(node, ctx));
  }

  async executeNode(node: LangNode, ctx: ExecuteFunctionContext) {
    this.setNodeStatus(node, 'running');
    this.emitStep();
    const inputs = this.getNodeInputs(node);

    try {
      console.log(`[${node.id}] IN  <=`, inputs);
      const outputs = await node.execute(inputs, ctx);
      console.log(`[${node.id}] OUT =>`, outputs);
      this.setNodeOutputs(node, outputs);

      this.executeResults.push({
        nodeId: node.id,
        inputs,
        outputs,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'ERR_END_OF_LIST') {
        this.setNodeStatus(node, 'done');
      } else {
        console.log('Error executing node id=' + node.id);
        console.log(err);
        this.setNodeStatus(node, 'error');
        this.cancelExecution = true;
        return;
      }
    }

    if (node.type === 'loop' && !node.getInternalState().endReached) {
      console.log('pause loop');
      this.setNodeStatus(node, 'paused');
    } else {
      // regular node
      this.setNodeStatus(node, 'done');
    }

    this.execute(ctx); // cycle back
  }

  getNodeInputs(node: LangNode) {
    const inputNodes = this.graph.getInputNodesOf(node);
    const uniqueNodes = uniqBy(
      inputNodes.map((inputNode) => inputNode.node),
      (node) => node.id
    );
    const uniqueNodesIds = uniqueNodes.map((n) => n.id);
    const uniqueNodesOutputs = uniqueNodes.map((inputNode) =>
      this.getNodeOutputs(inputNode)
    );

    return inputNodes.reduce((acc, { input, node, edge }) => {
      const uniqueNodeIndex = uniqueNodesIds.indexOf(node.id);
      acc[input] = uniqueNodesOutputs[uniqueNodeIndex][edge.fromPort];
      return acc;
    }, {} as Record<string, any>);
  }

  getNodeOutputs(node: LangNode | string) {
    const id = typeof node === 'string' ? node : node.id;
    return this.nodeStates[id].outputs;
  }

  setNodeStatus(node: LangNode, status: NodeStatus) {
    console.log(`[${node.id}] ${this.nodeStates[node.id].status} -> ${status}`);
    this.nodeStates[node.id].status = status;
  }
  getNodeStatus(node: LangNode) {
    return this.nodeStates[node.id].status;
  }
  setNodeOutputs(node: LangNode, outputs: ExecuteFunctionOutputs) {
    this.nodeStates[node.id].outputs = outputs;
  }

  findNodesWithStatus(status: NodeStatus) {
    return this.graph.nodes.filter((node) => {
      return this.nodeStates[node.id].status === status;
    });
  }

  emitStep() {
    this.emit('step', {
      nodesStatus: Object.keys(this.nodeStates).map((nodeId) => {
        return { id: nodeId, status: this.nodeStates[nodeId].status };
      }),
    });
  }

  buildNodeStates() {
    const nodeStates = this.graph.nodes.reduce((acc, node) => {
      const inputNodes = this.graph.getInputNodesOf(node);
      acc[node.id] = {
        inputNodes,
        status: inputNodes.length === 0 ? 'ready' : 'awaiting',
        outputs: {},
      };
      return acc;
    }, {} as NodeStates);

    return nodeStates;
  }
}

function hasUnknownStates(nodeStates: NodeStates) {
  return !!Object.values(nodeStates).find(
    (nodeState) => nodeState.status === 'unknown'
  );
}
