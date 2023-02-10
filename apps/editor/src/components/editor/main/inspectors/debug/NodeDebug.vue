<script lang="ts" setup>
import { useCurrentChainStore } from "@/stores/currentChain";
import type { GraphNodeDataWithUi } from "@/stores/graphEditor";
import type { ExecuteResults } from "langgraph/dist/types";
import { toRefs } from "vue";
import NodeDebugRun from "./NodeDebugRun.vue";
const props = defineProps<{ node: GraphNodeDataWithUi }>();
const { node } = toRefs(props);
const currentChainStore = useCurrentChainStore();

function getNodeExecResult(results: ExecuteResults) {
  return results.find((res) => res.nodeId === node.value.id) || null;
}
</script>
<template>
  <div>
    <div v-for="run in currentChainStore.runs" :key="run.number">
      <NodeDebugRun
        :node-result="getNodeExecResult(run.results)"
        :number="run.number"
      />
    </div>
  </div>
</template>
