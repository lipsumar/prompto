<script setup lang="ts">
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { useEditorSettingsStore } from "@/stores/editorSettings";

const currentPromptStore = useCurrentPromptStore();
const editorSettings = useEditorSettingsStore();
</script>

<template>
  <div
    class="h-full bg-slate-50 border-t-2 border-t-blue-600"
    :class="{
      'overflow-y-auto': editorSettings.editorLayout === 'split-horizontal',
    }"
  >
    <div class="w-editor-content px-6 pt-6 h-full mx-auto">
      <div
        v-for="(output, i) in currentPromptStore.outputs"
        :key="output.id"
        class="mb-6 pb-4 border-b-2 border-dashed border-b-slate-300"
      >
        <div
          v-if="output.id !== 'pending'"
          class="whitespace-pre-wrap text-slate-500"
          :class="{ 'text-lg': i === 0, 'text-black': i === 0 }"
        >
          {{ output.content }}
        </div>
        <div v-else>
          <SpinnerLoader />
        </div>
      </div>
    </div>
  </div>
</template>
