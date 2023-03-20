<script setup lang="ts">
import EditorSidebar from "@/components/editor/EditorSidebar.vue";
import EditorMain from "@/components/editor/EditorMain.vue";
import { onMounted, onUnmounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { usePromptsStore } from "@/stores/prompts";
import { useEditorStore } from "@/stores/editor";
import { useChainsStore } from "@/stores/chains";
import { useUserFoldersStore } from "@/stores/userFolders";

const route = useRoute();
const promptsStore = usePromptsStore();
const chainsStore = useChainsStore();
const editorStore = useEditorStore();
const userFoldersStore = useUserFoldersStore();

const state = reactive({ ready: false });

onMounted(async () => {
  window.document.body.style.overflow = "hidden";
  editorStore.reset();

  Promise.all([
    promptsStore.init(route.params.projectId as string),
    chainsStore.init(route.params.projectId as string),
    userFoldersStore.init(route.params.projectId as string),
  ]).then(() => (state.ready = true));
});
onUnmounted(() => {
  window.document.body.style.overflow = "";
});
</script>

<template>
  <div class="h-screen flex" v-if="state.ready">
    <nav class="w-64 flex-none bg-slate-600 text-slate-50">
      <EditorSidebar :key="(route.params.projectId as string)" />
    </nav>
    <main class="flex-1 min-w-0 overflow-auto bg-slate-200 relative">
      <EditorMain :key="(route.params.projectId as string)" />
    </main>
  </div>
</template>
