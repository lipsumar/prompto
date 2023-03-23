import BlueprintNode from './Node';
import invariant from 'tiny-invariant';
import { matches } from 'lodash';

export type BlueprintEdge = {
  fromId: string;
  fromKey: string;
  toId: string;
  toKey: string;
};

export default class BlueprintGraph {
  nodes: { node: BlueprintNode; id: string }[] = [];
  edges: BlueprintEdge[] = [];

  addNode(id: string, node: BlueprintNode) {
    //@todo check for duplicate ids
    this.nodes.push({ node, id });
  }

  createEdge({ from, to }: { from: string; to: string }) {
    const [fromId, fromKey] = from.split('.');
    const [toId, toKey] = to.split('.');

    invariant(this.getNode(fromId).hasOutputKey(fromKey), `${from} not found`);
    invariant(this.getNode(toId).hasInputKey(toKey), `${to} not found`);

    this.edges.push({
      fromId,
      fromKey,
      toId,
      toKey,
    });
  }

  getNode(id: string) {
    const entry = this.nodes.find((n) => n.id === id);
    invariant(entry, `node#${id} not found`);
    return entry.node;
  }

  findEdges(filter: Partial<BlueprintEdge>) {
    return this.edges.filter(matches(filter));
  }

  getInputNodesOf(nodeId: string) {
    const edges = this.findEdges({ toId: nodeId });
    return edges.map((edge) => edge.fromId);
  }

  getFlowDependencies(nodeId: string) {
    const node = this.getNode(nodeId);
    return this.edges.filter(
      (edge) =>
        edge.fromId === nodeId && node.flowOutputs.includes(edge.fromKey)
    );
  }
}
