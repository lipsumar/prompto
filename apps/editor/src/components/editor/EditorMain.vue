<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import PromptEditor from "./main/PromptEditor.vue";
import PromptOutputs from "./main/PromptOutputs.vue";

const currentPromptStore = useCurrentPromptStore();
</script>

<template>
  <div v-if="currentPromptStore.prompt" class="min-h-screen overflow-hidden">
    <div class="h-[50vh]">
      <PromptEditor />
    </div>
    <div class="h-[50vh]">
      <PromptOutputs />
    </div>
  </div>
</template>
