<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";

const currentPromptStore = useCurrentPromptStore();
</script>

<template>
  <div class="h-full bg-slate-50 border-t-2 border-t-blue-600">
    <div class="pt-6 h-full overflow-y-auto w-1/2 mx-auto">
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
        <div v-else>Loading...</div>
      </div>
    </div>
  </div>
</template>
