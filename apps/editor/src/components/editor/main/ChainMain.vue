<script setup lang="ts">
import GraphEditor from "@/components/node-graph/GraphEditor.vue";

const graphData = {
  nodes: [
    {
      id: "a",
      inputs: ["foo", "bar"],
      outputs: ["default"],
      x: 10,
      y: 10,
    },
    {
      id: "b",
      inputs: ["default"],
      outputs: [],
      x: 200,
      y: 10,
    },
  ],
  edges: [
    {
      from: "a",
      fromPort: "default",
      to: "b",
      toPort: "default",
      id: 1,
    },
  ],
};
</script>

<template>
  <div class="w-full h-full">
    <GraphEditor :graph="graphData" />
  </div>
</template>
