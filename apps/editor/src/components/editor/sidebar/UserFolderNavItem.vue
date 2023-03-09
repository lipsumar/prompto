<script setup lang="ts">
import { trpc } from "@/trpc";
import NavItem from "./NavItem.vue";
import { useUserFoldersStore } from "@/stores/userFolders";
const props = defineProps(["text", "id"]);
const usrFoldersStore = useUserFoldersStore();

async function renameUserFolder(id: string, name: string) {
  await trpc.userFolder.rename.mutate({ userFolderId: id, name });
  usrFoldersStore.update();
}

async function deleteUserFolder(id: string) {
  await trpc.userFolder.delete.mutate({ id });
  usrFoldersStore.update();
}
</script>
<template>
  <NavItem
    :text="props.text"
    :id="props.id"
    type="userFolder"
    @rename="renameUserFolder($event.id, $event.value)"
    @delete="deleteUserFolder($event.id)"
  />
</template>
