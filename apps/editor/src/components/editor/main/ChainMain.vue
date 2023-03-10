<script setup lang="ts">
import GraphEditor from "@/components/node-graph/GraphEditor.vue";
import { useGraphEditorStore, type GraphData } from "@/stores/graphEditor";
import { trpc } from "@/trpc";
import ChainInspector from "./ChainInspector.vue";
import { useCurrentChainStore } from "@/stores/currentChain";
import invariant from "tiny-invariant";
import { reactive } from "vue";
const currentChainStore = useCurrentChainStore();
const state = reactive({
  running: false,
});
const editorStore = useGraphEditorStore();

function run(graph: GraphData) {
  invariant(currentChainStore.chain);
  state.running = true;
  trpc.chain.run
    .mutate({
      content: JSON.stringify(graph),
      id: currentChainStore.chain.id,
    })
    .then((chainRun) => {
      currentChainStore.addRun(chainRun);
      state.running = false;
      editorStore.setChainRun(JSON.parse(chainRun.content));
    });
}

function save(graph: GraphData) {
  currentChainStore.save(graph);
}
</script>

<template>
  <div v-if="currentChainStore.graph" class="min-h-screen flex">
    <div class="flex-1 min-w-0 overflow-auto">
      <GraphEditor
        :graph="currentChainStore.graph"
        :run-disabled="state.running"
        @run="run"
        @save="save"
      />
    </div>
    <div class="w-96 flex-none bg-white h-screen overflow-y-auto">
      <ChainInspector />
    </div>
  </div>
</template>
