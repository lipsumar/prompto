import { ref } from "vue";
import { defineStore } from "pinia";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import { trpc } from "@/trpc";

type Prompt = inferRouterOutputs<AppRouter>["prompt"]["get"];

export const useCurrentPromptStore = defineStore("currentPrompt", () => {
  const prompt = ref<Prompt | null>(null);

  async function setPrompt(promptId: string) {
    console.log("set", promptId);
    const promptData = await trpc.prompt.get.query({ id: promptId });
    prompt.value = promptData;
    console.log("->", promptData);
  }

  return { prompt, setPrompt };
});
