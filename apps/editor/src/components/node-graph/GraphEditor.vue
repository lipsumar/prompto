<script setup lang="ts">
import GraphViewport from "@/components/node-graph/GraphViewport.vue";
import GraphNode from "@/components/node-graph/GraphNode.vue";
import GraphEdge from "@/components/node-graph/GraphEdge.vue";
import {
  useGraphEditorStore,
  type InitGraphData,
  type GraphData,
} from "../../stores/graphEditor";
import { defineProps, onMounted, ref } from "vue";

const props = defineProps<{ graph: InitGraphData }>();
const viewport = ref<InstanceType<typeof GraphViewport>>();

const editorStore = useGraphEditorStore();
editorStore.init(props.graph);

/**
 * centers the view and zoom on a group nodes
 */
function zoomNodes(
  nodes: GraphData["nodes"],
  opts: { padding?: number; scale: number | null } = {
    padding: 50,
    scale: null,
  }
) {
  if (!nodes || !nodes.length) {
    return;
  }
  const padding = opts.padding || 50;
  const scale = opts.scale;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  nodes.forEach((node) => {
    if (node.x < left) left = node.x;
    if (node.x + node.width > right) right = node.x + node.width;
    if (node.y < top) top = node.y;
    if (node.y + node.height > bottom) bottom = node.y + node.height;
  });
  viewport.value?.zoomRect(
    {
      left: left - padding,
      top: top - padding,
      right: right + padding,
      bottom: bottom + padding,
    },
    { scale }
  );
}

onMounted(() => {
  zoomNodes(editorStore.nodes, { scale: 1 });
});
</script>

<template>
  <GraphViewport ref="viewport">
    <GraphEdge
      v-for="edge of props.graph.edges"
      :key="edge.id"
      :edge-id="edge.id"
    />
    <GraphNode
      v-for="node of props.graph.nodes"
      :key="node.id"
      :node-id="node.id"
    >
      <div class="font-bold">Node {{ node.id }}</div>
    </GraphNode>
  </GraphViewport>
</template>
