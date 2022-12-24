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
    console.log("set", promptId);
    const promptData = await trpc.prompt.get.query({ id: promptId });
    prompt.value = promptData;
    const promptVersionsData = await trpc.prompt.versions.query({ promptId });
    versions.value = promptVersionsData;
    currentVersion.value = promptVersionsData[0];

    const outputsData = await trpc.prompt.outputs.query({ promptId });
    outputs.value = outputsData;
  }

  return { prompt, setPrompt, versions, currentVersion, outputs };
});
