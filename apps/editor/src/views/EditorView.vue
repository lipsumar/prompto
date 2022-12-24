<script setup lang="ts">
import EditorSidebar from "@/components/editor/EditorSidebar.vue";
import EditorMain from "@/components/editor/EditorMain.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePromptsStore } from "@/stores/prompts";

const route = useRoute();
const promptsStore = usePromptsStore();

onMounted(async () => {
  promptsStore.init(route.params.projectId as string);
});
</script>

<template>
  <div class="min-h-screen flex">
    <nav class="w-64 flex-none bg-slate-600 text-slate-50">
      <EditorSidebar />
    </nav>
    <main class="flex-1 min-w-0 overflow-auto bg-slate-200">
      <EditorMain />
    </main>
  </div>
</template>
