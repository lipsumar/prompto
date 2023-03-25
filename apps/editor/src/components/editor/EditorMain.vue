<script setup lang="ts">
import ChainMain from "./main/ChainMain2.vue";
import PromptMain from "./main/PromptMain.vue";
import { useEditorStore } from "@/stores/editor";
import UserFolderMain from "./main/UserFolderMain.vue";

const editorStore = useEditorStore();
</script>

<template>
  <PromptMain v-if="editorStore.activeElement?.type === 'prompt'" />
  <ChainMain v-if="editorStore.activeElement?.type === 'chain'" />
  <UserFolderMain v-if="editorStore.activeElement?.type === 'userFolder'" />
</template>
