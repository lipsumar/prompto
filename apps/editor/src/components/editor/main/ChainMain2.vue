<script setup lang="ts">
import { useCurrentChainStore } from "@/stores/currentChain";
import BlueprintEditor from "../../blueprint-editor/BlueprintEditor.vue";
const currentChainStore = useCurrentChainStore();
</script>

<template>
  <BlueprintEditor v-if="currentChainStore.graph" />
</template>
