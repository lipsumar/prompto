import ChainEdge from './ChainEdge';
import ChainNode from './ChainNode';
import invariant from 'tiny-invariant';
import type { ApiInput } from './types';
import { uniqBy } from 'lodash';

export default class ChainGraph {
  nodes: ChainNode[] = [];
  edges: ChainEdge[] = [];
  private nextNodeId = 1;
  private nextEdgeId = 1;
  targetNode: ChainNode;

  constructor(targetNode: ChainNode) {
    this.targetNode = targetNode;
    this.addNode(targetNode);
  }

  addNode(node: ChainNode) {
    node.id = this.getNextNodeId();
    this.nodes.push(node);
  }

  createEdge({
    fromId,
    fromPort,
    toId,
    toPort,
  }: {
    fromId: number;
    fromPort: string;
    toId: number;
    toPort: string;
  }) {
    const from = this.getNode(fromId);
    invariant(from, 'cant find "from" node');
    invariant(
      from.getOutputPort(fromPort),
      `"from" node has no output port "${fromPort}"`
    );
    const to = this.getNode(toId);
    invariant(to, 'cant find "to" node');
    invariant(
      to.getInputPort(toPort),
      `"to" node has no input port "${toPort}"`
    );

    const edge = new ChainEdge(from, fromPort, to, toPort);
    this.addEdge(edge);
  }

  addEdge(edge: ChainEdge) {
    edge.id = this.getNextEdgeId();
    this.edges.push(edge);
  }

  execute(apiInput: ApiInput) {
    return this.executeImpl(this.targetNode, apiInput);
  }

  private async executeImpl(node: ChainNode, apiInput: ApiInput) {
    // get inputs
    let inputs = {};
    if (node.hasInputs()) {
      const inputNodes = this.getInputNodesOf(node);
      const uniqueNodes = uniqBy(
        inputNodes.map((inputNode) => inputNode.node),
        (node) => node.id
      );
      const uniqueNodesIds = uniqueNodes.map((n) => n.id);
      const uniqueNodesOutputs = await Promise.all(
        uniqueNodes.map((inputNode) => this.executeImpl(inputNode, apiInput))
      );

      inputs = inputNodes.reduce((acc, { input, node, edge }) => {
        const uniqueNodeIndex = uniqueNodesIds.indexOf(node.id);
        acc[input] = uniqueNodesOutputs[uniqueNodeIndex][edge.fromPort];
        return acc;
      }, {} as Record<string, any>);
    }

    // execute node
    node.status = 'executing';
    const nodeOutput = await node.execute(inputs, { apiInput });
    node.status = 'idle';

    return nodeOutput;
  }

  getNode(id: number) {
    return this.nodes.find((n) => n.id === id);
  }

  getInputNodesOf(node: ChainNode) {
    const edges = node.inputs
      .map((input) => this.getEdgeTo(node.id, input.id))
      .filter((edge): edge is ChainEdge => typeof edge !== 'undefined');
    return edges.map((edge) => ({ node: edge.from, input: edge.toPort, edge }));
  }

  getEdgeTo(toId: number, toPort: string) {
    return this.edges.find(
      (edge) => edge.to.id === toId && edge.toPort === toPort
    );
  }

  getNextNodeId() {
    const nextId = this.nextNodeId;
    this.nextNodeId += 1;
    return nextId;
  }

  getNextEdgeId() {
    const nextId = this.nextEdgeId;
    this.nextEdgeId += 1;
    return nextId;
  }
}
