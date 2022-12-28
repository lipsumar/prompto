<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { trpc } from "@/trpc";
import { FireIcon } from "@heroicons/vue/24/outline";
import { reactive, watch } from "vue";

const currentPromptStore = useCurrentPromptStore();

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
  }
);

async function submit() {
  if (!currentPromptStore.currentVersion) return;
  if (state.isSubmitting) return;
  state.isSubmitting = true;
  currentPromptStore.addPendingOutput();
  const res = await trpc.prompt.submit.mutate({
    content: state.text,
    promptVersionId: currentPromptStore.currentVersion.id,
    temperature: state.temperature,
  });
  currentPromptStore.resolvePendingOutput(res.output);
  state.isSubmitting = false;
}
</script>

<template>
  <div class="bg-slate-50 pt-6 h-full">
    <div class="w-editor-content px-6 mx-auto h-full flex flex-col">
      <textarea
        class="bg-transparent w-full h-full resize-none focus:outline-none text-lg"
        v-model="state.text"
      ></textarea>
      <div class="py-4 flex">
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
