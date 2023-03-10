<script setup lang="ts">
import { useCurrentUserFolderStore } from "@/stores/currentUserFolder";

const currentUserFolderStore = useCurrentUserFolderStore();
</script>

<template>
  <div v-if="currentUserFolderStore.dataObjects" class="p-8">
    <div
      v-if="currentUserFolderStore.dataObjects.length === 0"
      class="py-24 flex justify-center items-center text-gray-600"
    >
      This folder is empty
    </div>
    <div v-else class="grid grid-cols-3 gap-2">
      <div
        v-for="dataObject in currentUserFolderStore.dataObjects"
        :key="dataObject.id"
      >
        <div class="bg-white p-2 rounded h-full">
          <div v-if="dataObject.type === 'string'">
            {{ JSON.parse(dataObject.value) }}
          </div>
          <div v-if="dataObject.type === 'image'">
            <img
              :src="JSON.parse(dataObject.value)"
              class="object-scale-down"
              width="512"
              height="512"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
