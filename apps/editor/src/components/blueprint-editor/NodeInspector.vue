<script setup lang="ts">
import type { BlueprintPort, DataType } from "api";
import { reactive } from "vue";

const props = defineProps<{
  dataInputs: BlueprintPort[];
  selfInputs: Record<string, any>;
  nodeId: string;
  allowUserCreatedDataInputs: string[] | null;
}>();
const newInput = reactive({
  name: "",
  dataType: "",
});
defineEmits<{
  (
    e: "setSelfInput",
    opts: { nodeId: string; key: string; value: string }
  ): void;
  (
    e: "createNewInput",
    opts: { name: string; dataType: DataType; nodeId: string }
  ): void;
}>();
</script>
<template>
  <div class="bg-white shadow rounded h-full p-2">
    <h3>Inputs</h3>
    <div class="border border-gray-300 rounded-md overflow-hidden">
      <table class="table-fixed border-collapse">
        <thead>
          <tr>
            <th
              class="border-gray-300 font-normal text-left px-2 py-1"
              width="5%"
            >
              Key
            </th>

            <th class="border-l border-gray-300" width="80%"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="port of dataInputs" :key="port.key">
            <td class="border border-l-0 border-gray-300 px-2 py-1">
              {{ port.key }}<br />
              <span class="bg-blue-200 px-1 rounded-sm">{{
                port.dataType
              }}</span>
            </td>

            <td class="border border-r-0 border-gray-300 p-1">
              <textarea
                v-if="port.dataType === 'string'"
                :value="selfInputs[port.key] || ''"
                @input="
                  $emit('setSelfInput', {
                    key: port.key,
                    nodeId: nodeId,
                    value: ($event.target as HTMLTextAreaElement).value,
                  })
                "
                class="w-full"
              ></textarea>
              <input
                v-if="port.dataType === 'number'"
                type="number"
                :value="selfInputs[port.key] || ''"
                @input="
                  $emit('setSelfInput', {
                    key: port.key,
                    nodeId: nodeId,
                    value: Number(($event.target as HTMLTextAreaElement).value),
                  })
                "
                class="w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="allowUserCreatedDataInputs" class="mt-2 space-x-1">
      <input
        type="text"
        v-model="newInput.name"
        class="w-28 border border-gray-300 rounded px-1"
        placeholder="New input"
      />
      <select
        v-model="newInput.dataType"
        class="w-28 border border-gray-300 rounded px-1"
      >
        <option v-for="typeName of allowUserCreatedDataInputs" :key="typeName">
          {{ typeName }}
        </option>
      </select>
      <button
        @click="
          ($event) => {
            $emit('createNewInput', {
              name: newInput.name,
              dataType: newInput.dataType,
              nodeId: nodeId,
            });
            newInput.name = '';
            newInput.dataType = '';
          }
        "
        class="bg-blue-500 text-white px-2 rounded"
      >
        create
      </button>
    </div>
  </div>
</template>
