<script lang="ts" setup>
import type { ExecuteResult } from "langgraph/dist/types";
import { reactive, toRefs } from "vue";
import InputOutputTable from "./InputOutputTable.vue";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
const props = defineProps<{
  nodeResult: ExecuteResult | null;
  number: number;
}>();
const { nodeResult } = toRefs(props);
const state = reactive({ isOpen: false });
</script>
<template>
  <h3 class="font-bold flex items-center" @click="state.isOpen = !state.isOpen">
    <ChevronRightIcon class="w-5 h-5" v-if="!state.isOpen" />
    <ChevronDownIcon class="w-5 h-5" v-else />
    Run {{ props.number }}
  </h3>
  <div v-if="state.isOpen">
    <div v-if="nodeResult">
      <h4>Inputs</h4>
      <InputOutputTable :data="nodeResult" type="inputs" />
      <h4>Outputs</h4>
      <InputOutputTable :data="nodeResult" type="outputs" />
    </div>
    <div v-else>Node did not run</div>
  </div>
</template>
