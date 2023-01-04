import { ref } from "vue";
import { defineStore } from "pinia";
import invariant from "tiny-invariant";

export type GraphData = {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
};
export type InitGraphData = {
  nodes: Omit<
    GraphNodeData,
    "width" | "height" | "inputsOffset" | "outputsOffset"
  >[];
  edges: GraphEdgeData[];
};

export type GraphNodeData = {
  id: string;
  inputs: string[];
  outputs: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  inputsOffset: { x: number; y: number }[];
  outputsOffset: { x: number; y: number }[];
};

export type GraphEdgeData = {
  id: number;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
};

export const useGraphEditorStore = defineStore("graphEditor", () => {
  const nodes = ref<GraphNodeData[]>([]);
  const edges = ref<GraphEdgeData[]>([]);

  function init(graph: InitGraphData) {
    nodes.value = graph.nodes.map((node) => ({
      ...node,
      width: -1,
      height: -1,
      inputsOffset: node.inputs.map(() => ({ x: 0, y: 0 })),
      outputsOffset: node.inputs.map(() => ({ x: 0, y: 0 })),
    }));
    edges.value = graph.edges;
  }

  function getNode(nodeId: GraphNodeData["id"]) {
    const node = nodes.value.find((node) => node.id === nodeId);
    invariant(node);
    return node;
  }

  function getEdge(edgeId: GraphEdgeData["id"]) {
    const edge = edges.value.find((edge) => edge.id === edgeId);
    invariant(edge);
    return edge;
  }

  return { nodes, edges, init, getNode, getEdge };
});
