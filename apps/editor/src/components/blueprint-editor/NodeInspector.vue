<script setup lang="ts">
import type { BlueprintPort } from "api";

const props = defineProps<{
  dataInputs: BlueprintPort[];
  selfInputs: Record<string, any>;
  nodeId: string;
}>();
defineEmits<{
  (
    e: "setSelfInput",
    opts: { nodeId: string; key: string; value: string }
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
                    value: ($event.target as HTMLTextAreaElement).value,
                  })
                "
                class="w-full"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
