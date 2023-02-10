<script lang="ts" setup>
import { useGraphEditorStore } from "@/stores/graphEditor";
import { computed, ref } from "vue";
import PromptInspector from "./inspectors/PromptInspector.vue";
import InputInspector from "./inspectors/InputInspector.vue";
import NodeDebug from "./inspectors/debug/NodeDebug.vue";

const editorStore = useGraphEditorStore();
const node = computed(() => editorStore.selectedNode);

const mode = ref<"inspect" | "debug">("inspect");
</script>
<template>
  <div class="p-4" v-if="node">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-lg capitalize">{{ node.type }}</h3>
      <div class="font-mono px-2 py-1 bg-sky-100 rounded text-xs">
        id: {{ node.id }}
      </div>
    </div>
    <div class="flex border border-sky-400 rounded mb-2 overflow-hidden">
      <button
        class="w-1/2 py-1 text-center border-r border-sky-400"
        :class="{ 'bg-sky-100': mode === 'inspect' }"
        @click="mode = 'inspect'"
      >
        Inspect
      </button>
      <button
        class="w-1/2 py-1 text-center"
        :class="{ 'bg-sky-100': mode === 'debug' }"
        @click="mode = 'debug'"
      >
        Debug
      </button>
    </div>
    <div v-if="mode === 'inspect'">
      <PromptInspector v-if="node.type === 'prompt'" :node="node" />
      <InputInspector v-if="node.type === 'input'" :node="node" />
    </div>
    <div v-if="mode === 'debug'">
      <NodeDebug :node="node" />
    </div>
  </div>
  <div
    v-else
    class="p-4 h-full text-sky-800 opacity-70 flex flex-col justify-center items-center"
  >
    <h3 class="font-bold">Node inspector</h3>
    <p class="pb-40">Select a node to inspect or debug it</p>
  </div>
</template>
