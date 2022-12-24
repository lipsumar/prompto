<script setup lang="ts">
import { useRoute } from "vue-router";
import PromptEditor from "./main/PromptEditor.vue";
import PromptOutputs from "./main/PromptOutputs.vue";
const route = useRoute();
</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="h-[60vh]">
      <PromptEditor />
    </div>
    <div class="h-[40vh] bg-slate-800 text-slate-100">
      <PromptOutputs />
    </div>
  </div>
</template>
