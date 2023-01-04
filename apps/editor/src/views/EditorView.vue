<script setup lang="ts">
import EditorSidebar from "@/components/editor/EditorSidebar.vue";
import EditorMain from "@/components/editor/EditorMain.vue";
import { onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { usePromptsStore } from "@/stores/prompts";
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { useEditorSettingsStore } from "@/stores/editorSettings";
import { useEditorStore } from "@/stores/editor";
import { useChainsStore } from "@/stores/chains";

const route = useRoute();
const promptsStore = usePromptsStore();
const chainsStore = useChainsStore();
const editorStore = useEditorStore();

const state = reactive({ ready: false });
const editorSettings = useEditorSettingsStore();

onMounted(async () => {
  editorStore.reset();

  Promise.all([
    promptsStore.init(route.params.projectId as string),
    chainsStore.init(route.params.projectId as string),
  ]).then(() => (state.ready = true));
});

function switchLayout() {
  editorSettings.setEditorLayout(
    editorSettings.editorLayout === "page" ? "split-horizontal" : "page"
  );
}
</script>

<template>
  <div class="min-h-screen flex" v-if="state.ready">
    <nav class="w-64 flex-none bg-slate-600 text-slate-50">
      <EditorSidebar :key="(route.params.projectId as string)" />
    </nav>
    <main class="flex-1 min-w-0 overflow-auto bg-slate-200">
      <EditorMain :key="(route.params.projectId as string)" />
    </main>
  </div>
  <button
    class="absolute top-4 right-4 rounded bg-slate-200 text-slate-400 text-sm p-1"
    @click="() => switchLayout()"
    title="Switch editor layout"
  >
    <Cog6ToothIcon class="w-4 h-4" />
  </button>
</template>
