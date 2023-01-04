<script setup lang="ts">
import { useGraphEditorStore, type GraphEdgeData } from "@/stores/graphEditor";
import { computed, defineProps } from "vue";

const props = defineProps<{ edgeId: GraphEdgeData["id"] }>();
const graphEditorStore = useGraphEditorStore();

const edge = graphEditorStore.getEdge(props.edgeId);
const fromNode = graphEditorStore.getNode(edge.from);
const fromOutputIndex = fromNode.outputs.findIndex(
  (output) => output === edge.fromPort
);
const toNode = graphEditorStore.getNode(edge.to);
const toInputIndex = toNode.inputs.findIndex((input) => input === edge.toPort);
//console.log("->", toInputIndex, fromNode.);
const pos = computed(() => {
  const x1 = fromNode.x + fromNode.outputsOffset[fromOutputIndex].x;
  const y1 = fromNode.y + fromNode.outputsOffset[fromOutputIndex].y;
  const x2 = toNode.x + toNode.inputsOffset[toInputIndex].x;
  const y2 = toNode.y + toNode.inputsOffset[toInputIndex].y;
  return { x1, y1, x2, y2 };
});
const path = computed(() => {
  const { x1, y1, x2, y2 } = pos.value;
  let p = `M ${x1},${y1} `;
  // add two horizontal control points
  const distX = x1 - x2;
  const c1 = { x: x1 - distX / 2, y: y1 };
  const c2 = { x: x2 + distX / 2, y: y2 };
  p += ` C ${c1.x},${c1.y} ${c2.x},${c2.y} `;
  p += `${x2} ${y2}`;
  return p;
});
</script>

<template>
  <path class="edge" :d="path" stroke="#0ea5e9" stroke-width="4" fill="none" />
</template>
