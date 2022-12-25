<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";

const currentPromptStore = useCurrentPromptStore();
</script>

<template>
  <div class="p-4 h-full overflow-y-auto">
    <div
      v-for="output of currentPromptStore.outputs"
      :key="output.id"
      class="p-2 bg-slate-600 rounded flex mb-2"
    >
      <div class="pr-2" v-if="output.id !== 'pending'">
        <ChevronDownIcon class="w-4 h-4 mt-1" />
      </div>
      <div v-if="output.id !== 'pending'">{{ output.content }}</div>
      <div v-else>Loading...</div>
    </div>
  </div>
</template>
