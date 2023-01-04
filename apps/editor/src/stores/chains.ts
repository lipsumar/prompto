import { ref } from "vue";
import { defineStore } from "pinia";
import { trpc } from "@/trpc";

type Chain = { name: string | null; id: string };

export const useChainsStore = defineStore("chains", () => {
  const chains = ref<Chain[]>([]);
  const projectId = ref<string>("");

  async function update() {
    const chainsData = await trpc.chain.inProject.query({
      projectId: projectId.value,
    });
    chains.value = chainsData.map((p) => ({ id: p.id, name: p.name }));
    return null;
  }

  function init(id: string) {
    chains.value = [];
    projectId.value = id;
    return update();
  }

  return { chains, projectId, update, init };
});
