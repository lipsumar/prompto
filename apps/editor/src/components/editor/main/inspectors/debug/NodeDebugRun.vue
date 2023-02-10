<script lang="ts" setup>
import type { ExecuteResult } from "langgraph/dist/types";
import { reactive, toRefs } from "vue";
import InputOutputTable from "./InputOutputTable.vue";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
const props = defineProps<{
  nodeResult: ExecuteResult | null;
  number: number;
  date: Date;
}>();
const { nodeResult } = toRefs(props);
const state = reactive({ isOpen: false });
</script>
<template>
  <h3 class="flex items-center" @click="state.isOpen = !state.isOpen">
    <ChevronRightIcon class="w-5 h-5" v-if="!state.isOpen" />
    <ChevronDownIcon class="w-5 h-5" v-else />
    <span class="font-bold mr-2">Run {{ props.number }}</span>
    <span class="opacity-60">{{ props.date.toLocaleString() }}</span>
  </h3>
  <div v-if="state.isOpen">
    <div v-if="nodeResult">
      <InputOutputTable :data="nodeResult" type="inputs" />
      <InputOutputTable
        :data="nodeResult"
        type="outputs"
        v-if="nodeResult.nodeId !== '_target'"
      />
    </div>
    <div v-else>Node did not run</div>
  </div>
</template>
