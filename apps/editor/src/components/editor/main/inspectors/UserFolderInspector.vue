<script lang="ts" setup>
import type { GraphNodeDataWithUi } from "@/stores/graphEditor";
import { useUserFoldersStore } from "@/stores/userFolders";

import invariant from "tiny-invariant";
import { ref, toRefs } from "vue";

const foldersStore = useUserFoldersStore();
const props = defineProps<{ node: GraphNodeDataWithUi }>();
const { node } = toRefs(props);
invariant(node.value.type === "folder");
const config = ref(node.value.config);
</script>
<template>
  <div>
    <label class="block mb-6">
      <span class="text-gray-700">Folder</span>
      <!-- <input
        type="text"
        class="form-input w-full mt-1 rounded-md border-gray-30 p-2"
        :value="config.folderId"
        @input="(e) => (config.folderId = (e.target as HTMLInputElement).value)"
      /> -->
      <select
        class="form-select w-full mt-1 rounded-md border-gray-30"
        v-model="config.folderId"
      >
        <option
          v-for="folder of foldersStore.userFolders"
          :key="folder.id"
          :value="folder.id"
        >
          {{ folder.name }}
        </option>
      </select>
    </label>
  </div>
</template>
