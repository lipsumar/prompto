<script setup lang="ts">
defineEmits<{
  (e: "save"): void;
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
  </div>
</template>
