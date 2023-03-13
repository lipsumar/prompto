import { computed, ref } from "vue";
import { defineStore } from "pinia";
import invariant from "tiny-invariant";
import type { LangDataType } from "langgraph";
import type { JSONNode } from "langgraph/dist/core/LangGraph";

export type GraphData = {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
};

// pure data, without width/height/inputsOffset/outputsOffset
export type GraphNodeData = JSONNode & { x: number; y: number };

// add UI fields
export type GraphNodeDataWithUi = GraphNodeData & {
  width: number;
  height: number;
  inputsOffset: Record<string, { x: number; y: number }>;
  outputsOffset: Record<string, { x: number; y: number }>;
  status: string;
};

export type GraphEdgeData = {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
};

export type GraphPortData = {
  port: string;
  type: string;
  node: GraphNodeDataWithUi;
  edge?: GraphEdgeData;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

type ChainRunContent = {
  nodeId: string;
  inputs: Record<string, { type: LangDataType; value: any }>;
  outputs: Record<string, { type: LangDataType; value: any }>;
}[];

function initNodeToNode(node: GraphNodeData): GraphNodeDataWithUi {
  return {
    ...node,
    width: -1,
    height: -1,
    inputsOffset: Object.keys(node.inputs).reduce((acc, key) => {
      acc[key] = { x: 0, y: 0 };
      return acc;
    }, {} as Record<string, { x: 0; y: 0 }>),
    outputsOffset: Object.keys(node.outputs).reduce((acc, key) => {
      acc[key] = { x: 0, y: 0 };
      return acc;
    }, {} as Record<string, { x: 0; y: 0 }>),
    status: "idle",
  };
}

export const useGraphEditorStore = defineStore("graphEditor", () => {
  const nodes = ref<GraphNodeDataWithUi[]>([]);
  const edges = ref<GraphEdgeData[]>([]);
  const ports = computed<GraphPortData[]>(() => {
    return nodes.value.flatMap((node) => {
      return Object.keys(node.inputs).map((input) => {
        const edge = edges.value.find(
          (e) => e.to === node.id && e.toPort === input
        );
        const portOffset = node.inputsOffset[input];
        return {
          port: input,
          type: "input",
          node,
          edge,
          bbox: {
            x: node.x + portOffset.x - 10,
            y: node.y + portOffset.y - 10,
            width: 20,
            height: 20,
          },
        };
      });
    });
  });
  const selectedNodeId = ref<string | null>(null);
  const selectedNode = computed<GraphNodeDataWithUi | null>(() => {
    return nodes.value.find((n) => n.id === selectedNodeId.value) || null;
  });

  function init(graph: GraphData) {
    nodes.value = graph.nodes.map(initNodeToNode);
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

  function addNode(node: GraphNodeData) {
    nodes.value.push(initNodeToNode(node));
  }

  function removeNode(nodeId: string) {
    const edges = [...getInputEdges(nodeId), ...getOutputEdges(nodeId)];
    edges.forEach((edge) => removeEdge(edge.id));
    nodes.value = nodes.value.filter((n) => n.id !== nodeId);
  }

  function addEdge(edge: GraphEdgeData) {
    edges.value.push({ ...edge });
  }

  function removeEdge(edgeId: string) {
    edges.value = edges.value.filter((edge) => edge.id !== edgeId);
  }

  function getOutputEdges(nodeId: string) {
    return edges.value.filter((edge) => edge.from === nodeId);
  }
  function getInputEdges(nodeId: string) {
    return edges.value.filter((edge) => edge.to === nodeId);
  }

  function setChainRun(chainRunContent: ChainRunContent) {
    chainRunContent.forEach((result) => {
      const node = getNode(result.nodeId);
      console.log(node);
      if (!node) return;
      if (node.type === "text" && result.inputs && result.inputs.default) {
        node.config.text = result.inputs.default.value;
      }
      if (node.type === "image" && result.inputs && result.inputs.default) {
        node.config.image = result.inputs.default.value;
      }
    });
  }

  function updateNodesStatus(nodesStatus: { id: string; status: string }[]) {
    nodes.value.forEach((node) => {
      const nodeData = nodesStatus.find((n) => n.id === node.id);
      if (nodeData) {
        node.status = nodeData.status;
      }
    });
  }

  return {
    nodes,
    edges,
    init,
    getNode,
    removeNode,
    getEdge,
    addNode,
    addEdge,
    removeEdge,
    getOutputEdges,
    getInputEdges,
    ports,
    getGraph() {
      return { nodes: nodes.value, edges: edges.value };
    },
    selectNode(id: string | null) {
      selectedNodeId.value = id;
    },
    selectedNode,
    setChainRun,
    updateNodesStatus,
  };
});
