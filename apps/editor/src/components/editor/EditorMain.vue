<script setup lang="ts">
import PromptEditor from "./main/PromptEditor.vue";
import PromptOutputs from "./main/PromptOutputs.vue";
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="h-[50vh]">
      <PromptEditor />
    </div>
    <div class="h-[50vh]">
      <PromptOutputs />
    </div>
  </div>
</template>
