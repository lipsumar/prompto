<script setup lang="ts">
import { useGraphEditorStore, type GraphEdgeData } from "@/stores/graphEditor";
import { computed, defineProps } from "vue";
import GraphLine from "./GraphLine.vue";

const props = defineProps<{ edgeId: GraphEdgeData["id"] }>();
const graphEditorStore = useGraphEditorStore();

const edge = graphEditorStore.getEdge(props.edgeId);
const fromNode = graphEditorStore.getNode(edge.from);
// const fromOutputIndex = Object.keys(fromNode.outputs).findIndex(
//   (output) => output === edge.fromPort
// );
const toNode = graphEditorStore.getNode(edge.to);
// const toInputIndex = Object.keys(toNode.inputs).findIndex(
//   (input) => input === edge.toPort
// );
//console.log("->", toInputIndex, fromNode.);
const pos = computed(() => {
  const x1 = fromNode.x + fromNode.outputsOffset[edge.fromPort].x;
  const y1 = fromNode.y + fromNode.outputsOffset[edge.fromPort].y;
  const x2 = toNode.x + toNode.inputsOffset[edge.toPort].x;
  const y2 = toNode.y + toNode.inputsOffset[edge.toPort].y;
  return { x1, y1, x2, y2 };
});

function removeEdge() {
  graphEditorStore.removeEdge(edge.id);
}
</script>

<template>
  <GraphLine
    :x1="pos.x1"
    :y1="pos.y1"
    :x2="pos.x2"
    :y2="pos.y2"
    :interactive="true"
    @interactive-clicked="removeEdge"
  />
</template>
