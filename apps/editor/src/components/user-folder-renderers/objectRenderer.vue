<script setup lang="ts">
import type { DataType } from "api";
import AnyRenderer from "./anyRenderer.vue";

defineProps<{ object: Record<string, { type: DataType; value: any }> }>();
</script>
<template>
  <div v-for="(data, key) in object" :key="key">
    <div class="font-mono font-bold">{{ key }} ({{ data.type }})</div>
    <AnyRenderer :value="data.value" :type="data.type" />
  </div>
</template>
