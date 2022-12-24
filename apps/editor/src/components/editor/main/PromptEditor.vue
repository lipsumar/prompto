<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";

const currentPromptStore = useCurrentPromptStore();
</script>

<template>
  <div class="px-20 pt-6 h-full">
    <div
      class="bg-slate-50 h-full rounded-t-lg shadow-md p-8 pb-0 flex flex-col"
    >
      <textarea
        class="bg-transparent w-full h-full resize-none focus:outline-none text-lg"
        :value="currentPromptStore.currentVersion?.content"
      ></textarea>
      <div class="py-2">
        <button
          class="bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
