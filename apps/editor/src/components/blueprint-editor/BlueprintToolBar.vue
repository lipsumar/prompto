<script setup lang="ts">
import { PlayIcon } from "@heroicons/vue/24/solid";
defineEmits<{
  (e: "save"): void;
  (e: "run"): void;
}>();
</script>
<template>
  <div class="absolute top-2 left-2 right-2 flex space-x-2">
    <button
      class="px-3 h-8 flex items-center justify-center bg-white shadow rounded"
      @click="$emit('save')"
    >
      Save
    </button>

    <button
      class="px-3 h-8 flex items-center justify-center bg-white shadow rounded"
      @click="$emit('run')"
    >
      Run
      <PlayIcon class="w-4 h-4" />
    </button>
  </div>
</template>
