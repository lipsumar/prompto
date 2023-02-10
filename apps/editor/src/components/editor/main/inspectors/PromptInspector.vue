<script lang="ts" setup>
import {
  useGraphEditorStore,
  type GraphNodeDataWithUi,
} from "@/stores/graphEditor";
import { PlusIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import type { LangDataType } from "langgraph";
import invariant from "tiny-invariant";
import { reactive, ref, toRefs } from "vue";

const editorStore = useGraphEditorStore();
const props = defineProps<{ node: GraphNodeDataWithUi }>();
const { node } = toRefs(props);
invariant(node.value.type === "prompt");
const config = ref(node.value.config);

const newInputForm = reactive<{ key: string; type: LangDataType }>({
  key: "",
  type: "string",
});

function addInput() {
  if (!newInputForm.key) return;
  node.value.inputs[newInputForm.key] = newInputForm.type;
  newInputForm.key = "";
  newInputForm.type = "string";
}
function removeInput(key: string) {
  const port = editorStore.ports.find(
    (p) => p.node.id === node.value.id && p.port === key
  );
  invariant(port);
  if (port.edge) {
    editorStore.removeEdge(port.edge.id);
  }

  delete node.value.inputs[key];
}
</script>
<template>
  <div>
    <label class="block mb-6">
      <span class="text-gray-700">Text</span>
      <textarea
        class="form-textarea w-full mt-1 rounded-md border-gray-30 text-sm p-2 h-60"
        :value="config.text"
        @input="(e) => (config.text = (e.target as HTMLTextAreaElement).value)"
      ></textarea>
    </label>
    <div>
      <h3 class="font-bold">Inputs</h3>
      <div class="border border-gray-300 rounded-md overflow-hidden">
        <table class="table-fixed border-collapse">
          <thead>
            <tr>
              <th
                class="border-gray-300 font-normal text-left px-2 py-1"
                width="45%"
              >
                Key
              </th>
              <th
                class="border-r border-l border-gray-300 font-normal text-left px-2 py-1"
                width="40%"
              >
                Type
              </th>
              <th class="border-l border-gray-300" width="5%"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(type, input) of node.inputs" :key="input">
              <td class="border border-l-0 border-gray-300 px-2 py-1">
                {{ input }}
              </td>
              <td class="border border-gray-300 px-2 py-1">{{ type }}</td>
              <td class="border border-r-0 border-gray-300 p-1">
                <button
                  @click="removeInput(input)"
                  class="bg-blue-200 w-6 h-6 flex justify-center items-center rounded shadow-sm"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr>
              <td class="border-t border-gray-300 px-2 py-1">
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded px-1"
                  v-model="newInputForm.key"
                />
              </td>
              <td class="border-l border-t border-gray-300 px-2 py-1">
                <select
                  class="w-full border border-gray-300 rounded"
                  v-model="newInputForm.type"
                >
                  <option value="string">string</option>
                </select>
              </td>
              <td class="border-l border-t border-gray-300 text-center p-1">
                <button
                  @click="addInput()"
                  class="bg-blue-200 w-6 h-6 flex justify-center items-center rounded shadow-sm"
                >
                  <PlusIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
