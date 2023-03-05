<script setup lang="ts">
import ChainMain from "./main/ChainMain.vue";
import PromptMain from "./main/PromptMain.vue";
import { useEditorStore } from "@/stores/editor";

const editorStore = useEditorStore();
</script>

<template>
  <PromptMain v-if="editorStore.activeElement?.type === 'prompt'" />
  <ChainMain v-if="editorStore.activeElement?.type === 'chain'" />
</template>
