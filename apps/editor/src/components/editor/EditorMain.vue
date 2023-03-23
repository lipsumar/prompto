<script setup lang="ts">
import ChainMain from "./main/ChainMain.vue";
import PromptMain from "./main/PromptMain.vue";
import { useEditorStore } from "@/stores/editor";
import UserFolderMain from "./main/UserFolderMain.vue";
import BlueprintEditor from "../blueprint-editor/BlueprintEditor.vue";

const editorStore = useEditorStore();
</script>

<template>
  <PromptMain v-if="editorStore.activeElement?.type === 'prompt'" />
  <!-- <ChainMain v-if="editorStore.activeElement?.type === 'chain'" /> -->
  <BlueprintEditor v-if="editorStore.activeElement?.type === 'chain'" />
  <UserFolderMain v-if="editorStore.activeElement?.type === 'userFolder'" />
</template>
