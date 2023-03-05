<script setup lang="ts">
import { trpc } from "@/trpc";
import NavItem from "./NavItem.vue";
import { useChainsStore } from "@/stores/chains";
const props = defineProps(["text", "id"]);
const chainsStore = useChainsStore();

async function renameChain(id: string, name: string) {
  await trpc.chain.rename.mutate({ chainId: id, name });
  chainsStore.update();
}

async function deleteChain(id: string) {
  await trpc.chain.delete.mutate({ id });
  chainsStore.update();
}
</script>
<template>
  <NavItem
    :text="props.text"
    :id="props.id"
    type="chain"
    @rename="renameChain($event.id, $event.value)"
    @delete="deleteChain($event.id)"
  />
</template>
