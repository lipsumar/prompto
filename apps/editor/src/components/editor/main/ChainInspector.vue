<script lang="ts" setup>
import { useGraphEditorStore } from "@/stores/graphEditor";
import { computed } from "vue";
import PromptInspector from "./inspectors/PromptInspector.vue";

const editorStore = useGraphEditorStore();
const node = computed(() => editorStore.selectedNode);
</script>
<template>
  <div class="p-4" v-if="node">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg capitalize">{{ node.type }}</h3>
      <div class="font-mono px-2 py-1 bg-sky-100 rounded text-xs">
        id: {{ node.id }}
      </div>
    </div>
    <PromptInspector v-if="node.type === 'prompt'" :node="node" />
  </div>
  <div
    v-else
    class="p-4 h-full text-sky-800 opacity-70 flex flex-col justify-center items-center"
  >
    <h3 class="font-bold">Node inspector</h3>
    <p class="pb-40">Select a node to inspect it</p>
  </div>
</template>
