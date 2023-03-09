import { ref } from "vue";
import { defineStore } from "pinia";
import { trpc } from "@/trpc";

type UserFolder = { name: string; id: string };

export const useUserFoldersStore = defineStore("userFolders", () => {
  const userFolders = ref<UserFolder[]>([]);
  const projectId = ref<string>("");

  async function update() {
    const userFoldersData = await trpc.userFolder.inProject.query({
      projectId: projectId.value,
    });
    userFolders.value = userFoldersData.map((uf) => ({
      id: uf.id,
      name: uf.name,
    }));
    return null;
  }

  function init(id: string) {
    userFolders.value = [];
    projectId.value = id;
    return update();
  }

  return { userFolders: userFolders, projectId, update, init };
});
