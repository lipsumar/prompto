import { ref } from "vue";
import { defineStore } from "pinia";
import { trpc } from "@/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";

type Prompt = { name: string | null; id: string };
type Project = inferRouterOutputs<AppRouter>["project"]["get"];

export const usePromptsStore = defineStore("prompts", () => {
  const prompts = ref<Prompt[]>([]);
  const projectId = ref<string>("");
  const project = ref<Project | null>(null);

  async function update() {
    const promptsData = await trpc.prompt.inProject.query({
      projectId: projectId.value,
    });
    prompts.value = promptsData.map((p) => ({ id: p.id, name: p.name }));
    const projectData = await trpc.project.get.query({ id: projectId.value });
    project.value = projectData;
    return null;
  }

  function init(id: string) {
    prompts.value = [];
    projectId.value = id;
    return update();
  }

  return { prompts, projectId, update, init, project };
});
