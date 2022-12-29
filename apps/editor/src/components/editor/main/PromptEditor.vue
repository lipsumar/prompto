<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { useEditorSettingsStore } from "@/stores/editorSettings";
import { trpc } from "@/trpc";
import { FireIcon } from "@heroicons/vue/24/outline";
import { onMounted, reactive, ref, watch } from "vue";

const currentPromptStore = useCurrentPromptStore();
const editorSettings = useEditorSettingsStore();
const textareaRef = ref<HTMLTextAreaElement | undefined>();

const state = reactive<{
  text: string;
  isSubmitting: boolean;
  temperature: number;
}>({
  text: "",
  isSubmitting: false,
  temperature: 0.7,
});

watch(
  () => currentPromptStore.currentVersion?.promptId,
  () => {
    state.text = currentPromptStore.currentVersion?.content || "";
    state.isSubmitting = false;
    setTimeout(() => {
      resizeTextarea(textareaRef.value);
    });
  }
);

onMounted(() => {
  resizeTextarea(textareaRef.value);
});

async function submit() {
  if (state.isSubmitting) return;
  state.isSubmitting = true;
  currentPromptStore.addPendingOutput();
  const res = await trpc.prompt.submit.mutate({
    content: state.text,
    promptId: currentPromptStore.prompt!.id,
    temperature: state.temperature,
  });
  currentPromptStore.resolvePendingOutput(res.output);
  state.isSubmitting = false;
}

function resizeTextarea(el?: HTMLTextAreaElement) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
</script>

<template>
  <div class="bg-slate-50 h-full">
    <div class="h-full flex flex-col">
      <div
        class="h-full pt-6 px-6"
        :class="{
          'overflow-y-auto': editorSettings.editorLayout === 'split-horizontal',
        }"
      >
        <textarea
          class="w-editor-content px-6 mx-auto overflow-hidden bg-transparent block w-full resize-none focus:outline-none text-lg"
          :class="{
            'min-h-full': editorSettings.editorLayout === 'split-horizontal',
            'min-h-[30vh]': editorSettings.editorLayout === 'page',
          }"
          v-model="state.text"
          ref="textareaRef"
          @input="
          (e) => {
            resizeTextarea((e.target as HTMLTextAreaElement))
          }
        "
          placeholder="Enter your pompt here..."
        ></textarea>
      </div>
      <div class="py-4 flex w-editor-content px-6 mx-auto w-full">
        <button
          class="flex-grow-0 bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-75"
          @click="submit"
          :disabled="state.isSubmitting"
        >
          Submit
        </button>
        <div class="ml-4 flex items-center">
          <FireIcon class="w-6 h-6 mr-2" /><input
            type="range"
            v-model.number="state.temperature"
            min="0"
            max="1"
            step="0.01"
          /><span class="font-semibold text-slate-700 pl-2">{{
            state.temperature
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
