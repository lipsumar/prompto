<script setup lang="ts">
import GraphEditor from "@/components/node-graph/GraphEditor.vue";
import type { GraphData } from "@/stores/graphEditor";
import { trpc } from "@/trpc";
import ChainInspector from "./ChainInspector.vue";
import { useCurrentChainStore } from "@/stores/currentChain";
import invariant from "tiny-invariant";
const currentChainStore = useCurrentChainStore();

/*
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
      config: {
        text: "how do you feel living in this API? Is the surrounding to your liking? Do you need anything?",
      },
      inputs: {},
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
*/
function run(graph: GraphData) {
  invariant(currentChainStore.chain);
  trpc.chain.run
    .mutate({ content: JSON.stringify(graph), id: currentChainStore.chain.id })
    .then((chainRun) => {
      console.log(chainRun);
    });
}

function save(graph: GraphData) {
  currentChainStore.save(graph);
}
</script>

<template>
  <div v-if="currentChainStore.graph" class="min-h-screen flex">
    <div class="flex-1 min-w-0 overflow-auto">
      <GraphEditor :graph="currentChainStore.graph" @run="run" @save="save" />
    </div>
    <div class="w-96 flex-none bg-white h-full h-screen overflow-y-auto">
      <ChainInspector />
    </div>
  </div>
</template>
