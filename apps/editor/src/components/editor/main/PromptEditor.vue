<script setup lang="ts">
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { trpc } from "@/trpc";
import { reactive, registerRuntimeCompiler, watch } from "vue";

const currentPromptStore = useCurrentPromptStore();

const state = reactive({ text: "", isSubmitting: false });

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
  });
  currentPromptStore.resolvePendingOutput(res.output);
  state.isSubmitting = false;
}
</script>

<template>
  <div class="px-20 pt-6 h-full">
    <div
      class="bg-slate-50 h-full rounded-t-lg shadow-md p-8 pb-0 flex flex-col"
    >
      <textarea
        class="bg-transparent w-full h-full resize-none focus:outline-none text-lg"
        v-model="state.text"
      ></textarea>
      <div class="py-2">
        <button
          class="bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-75"
          @click="submit"
          :disabled="state.isSubmitting"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
