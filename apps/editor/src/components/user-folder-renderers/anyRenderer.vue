<script setup lang="ts">
import type { DataType } from "api";
import ObjectRenderer from "./objectRenderer.vue";

const props = defineProps<{
  type: DataType;
  value: any;
}>();
</script>
<template>
  <div v-if="type === 'string' || type === 'number'">
    {{ value }}
  </div>
  <div v-if="type === 'image'">
    <img :src="value" class="object-scale-down" width="512" height="512" />
  </div>
  <div v-if="type === 'object'">
    <ObjectRenderer :object="value" />
  </div>
</template>
