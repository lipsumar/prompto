import { ref } from "vue";
import { defineStore } from "pinia";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import { trpc } from "@/trpc";

type Prompt = inferRouterOutputs<AppRouter>["prompt"]["get"];
type PromptVersion = inferRouterOutputs<AppRouter>["prompt"]["versions"][0];
type PromptOutput = inferRouterOutputs<AppRouter>["prompt"]["outputs"][0];

export const useCurrentPromptStore = defineStore("currentPrompt", () => {
  const prompt = ref<Prompt | null>(null);
  const versions = ref<PromptVersion[] | null>([]);
  const currentVersion = ref<PromptVersion | null>(null);
  const outputs = ref<PromptOutput[] | null>(null);

  async function setPrompt(promptId: string) {
    const promptData = await trpc.prompt.get.query({ id: promptId });
    prompt.value = promptData;
    const promptVersionsData = await trpc.prompt.versions.query({ promptId });
    versions.value = promptVersionsData;
    currentVersion.value = promptVersionsData[0];

    const outputsData = await trpc.prompt.outputs.query({ promptId });
    outputs.value = outputsData;
  }

  function addPendingOutput() {
    if (!currentVersion.value) return;

    outputs.value?.unshift({
      content: "",
      createdAt: "",
      id: "pending",
      promptVersionId: currentVersion.value.id,
    });
  }
  function resolvePendingOutput(output: PromptOutput) {
    if (!outputs.value) return;

    outputs.value[0] = output;
  }

  function reset() {
    prompt.value = null;
    versions.value = [];
    currentVersion.value = null;
    outputs.value = null;
  }

  return {
    prompt,
    setPrompt,
    versions,
    currentVersion,
    outputs,
    addPendingOutput,
    resolvePendingOutput,
    reset,
  };
});
