import { defineStore } from "pinia";
import { trpc } from "@/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import { ref } from "vue";

type UserFolder = inferRouterOutputs<AppRouter>["userFolder"]["get"];
type DataObject =
  inferRouterOutputs<AppRouter>["userFolder"]["getDataObjects"][0];

export const useCurrentUserFolderStore = defineStore(
  "currentUserFolder",
  () => {
    const userFolder = ref<UserFolder | null>(null);
    const dataObjects = ref<null | DataObject[]>(null);

    return {
      userFolder,
      dataObjects,
      async setUserFolder(userFolderId: string) {
        userFolder.value = null;

        const userFolderData = await trpc.userFolder.get.query({
          id: userFolderId,
        });
        if (!userFolderData) {
          throw new Error("cant find userFolder id" + userFolderId);
        }
        //console.log({ chainData });
        userFolder.value = userFolderData;

        const dataObjectsData = await trpc.userFolder.getDataObjects.query({
          id: userFolderData.id,
        });
        dataObjects.value = dataObjectsData;
      },
    };
  }
);
