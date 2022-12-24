import { ref } from "vue";
import { defineStore } from "pinia";
import { trpc } from "@/trpc";

type Prompt = { name: string | null; id: string };

export const usePromptsStore = defineStore("prompts", () => {
  const prompts = ref<Prompt[]>([]);
  const projectId = ref<string>("");

  async function update() {
    const promptsData = await trpc.prompt.inProject.query({
      projectId: projectId.value,
    });
    prompts.value = promptsData.map((p) => ({ id: p.id, name: p.name }));
  }

  function init(id: string) {
    prompts.value = [];
    projectId.value = id;
    update();
  }

  return { prompts, projectId, update, init };
});
