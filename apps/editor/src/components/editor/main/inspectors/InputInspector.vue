<script lang="ts" setup>
import {
  useGraphEditorStore,
  type GraphNodeDataWithUi,
} from "@/stores/graphEditor";

import invariant from "tiny-invariant";
import { ref, toRefs } from "vue";

const editorStore = useGraphEditorStore();
const props = defineProps<{ node: GraphNodeDataWithUi }>();
const { node } = toRefs(props);
invariant(node.value.type === "input");
const config = ref(node.value.config);
</script>
<template>
  <div>
    <label class="block mb-6">
      <span class="text-gray-700">Input key</span>
      <input
        type="text"
        class="form-input w-full mt-1 rounded-md border-gray-30 p-2"
        :value="config.inputKey"
        @input="(e) => (config.inputKey = (e.target as HTMLInputElement).value)"
      />
    </label>

    <label class="block mb-6">
      <span class="text-gray-700">Default value</span>
      <input
        type="text"
        class="form-input w-full mt-1 rounded-md border-gray-30 p-2"
        :value="config.defaultValue"
        @input="(e) => (config.defaultValue = (e.target as HTMLInputElement).value)"
      />
    </label>
  </div>
</template>
