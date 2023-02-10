<script lang="ts" setup>
import type { ExecuteResult } from "langgraph/dist/types";

const props = defineProps<{
  data: ExecuteResult;
  type: "inputs" | "outputs";
}>();
</script>
<template>
  <h4 class="capitalize">{{ props.type }}</h4>
  <div
    v-if="Object.keys(props.data[props.type]).length > 0"
    class="border border-gray-300 rounded-md overflow-hidden"
  >
    <table class="table-fixed border-collapse">
      <tr v-for="(val, key) of props.data[props.type]" :key="key">
        <td class="p-1 font-mono" valign="top">{{ key }}</td>
        <td class="p-1">{{ val.value }}</td>
      </tr>
    </table>
  </div>
  <div v-else>No {{ props.type }}</div>
</template>
