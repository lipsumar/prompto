<script setup lang="ts">
import GraphEditor from "@/components/node-graph/GraphEditor.vue";
import type { GraphData } from "@/stores/graphEditor";
import { trpc } from "@/trpc";

const graphData: GraphData = {
  nodes: [
    {
      id: "_target",
      type: "output",
      inputs: { default: "string" },
      outputs: {},
      x: 300,
      y: 100,
    },
    {
      id: "a",
      type: "prompt" as const,
      config: { text: "how do you feel living in this API?" },
      inputs: { foo: "string", bar: "string" },
      outputs: { default: "string" },
      x: 10,
      y: 10,
    },
  ],
  edges: [
    {
      from: "a",
      fromPort: "default",
      to: "_target",
      toPort: "default",
      id: "1",
    },
  ],
};

function run(graph: GraphData) {
  trpc.chain.run.mutate({ content: JSON.stringify(graph) }).then((res) => {
    console.log(res);
  });
}
</script>

<template>
  <div class="w-full h-full">
    <GraphEditor :graph="graphData" @run="run" />
  </div>
</template>
