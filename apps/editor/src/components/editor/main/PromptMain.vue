<script setup lang="ts">
import PromptEditor from "../main/PromptEditor.vue";
import PromptOutputs from "../main/PromptOutputs.vue";
import { useEditorSettingsStore } from "@/stores/editorSettings";

const editorSettings = useEditorSettingsStore();
</script>

<template>
  <div
    :class="{
      'h-full max-h-screen overflow-y-auto bg-slate-50':
        editorSettings.editorLayout === 'page',
      'min-h-screen overflow-hidden':
        editorSettings.editorLayout === 'split-horizontal',
    }"
  >
    <div
      :class="{
        'h-[50vh]': editorSettings.editorLayout === 'split-horizontal',
      }"
    >
      <PromptEditor />
    </div>
    <div
      :class="{
        'h-[50vh]': editorSettings.editorLayout === 'split-horizontal',
      }"
    >
      <PromptOutputs />
    </div>
  </div>
</template>
