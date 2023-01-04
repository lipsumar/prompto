<script setup lang="ts">
import GraphViewport from "@/components/node-graph/GraphViewport.vue";
import GraphNode from "@/components/node-graph/GraphNode.vue";
import GraphEdge from "@/components/node-graph/GraphEdge.vue";
import {
  useGraphEditorStore,
  type InitGraphData,
} from "../../stores/graphEditor";
import { defineProps } from "vue";

const props = defineProps<{ graph: InitGraphData }>();

const editorStore = useGraphEditorStore();
editorStore.init(props.graph);
</script>

<template>
  <GraphViewport>
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
