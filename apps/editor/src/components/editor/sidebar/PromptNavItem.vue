<script setup lang="ts">
import { trpc } from "@/trpc";
import NavItem from "./NavItem.vue";
import { usePromptsStore } from "@/stores/prompts";
const props = defineProps(["text", "id"]);
const promptsStore = usePromptsStore();

async function renamePrompt(id: string, name: string) {
  await trpc.prompt.rename.mutate({ promptId: id, name });
  promptsStore.update();
}

async function deletePrompt(id: string) {
  await trpc.prompt.delete.mutate({ id });
  promptsStore.update();
}
</script>
<template>
  <NavItem
    :text="props.text"
    :id="props.id"
    type="prompt"
    @rename="renamePrompt($event.id, $event.value)"
    @delete="deletePrompt($event.id)"
  />
</template>
