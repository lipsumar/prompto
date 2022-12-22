<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { RouterLink } from "vue-router";

const props = defineProps(["title", "projectId"]);
</script>

<template>
  <RouterLink
    :to="`/project/${props.projectId}`"
    class="block rounded p-3 bg-white shadow-sm min-h-full group hover:bg-blue-500 hover:text-white"
  >
    <h3 class="text-base font-semibold mb-3">{{ props.title }}</h3>
    <button
      class="px-3 py-1 text-sm bg-sky-300 text-white rounded-full shadow-sm flex items-center invisible group-hover:visible"
    >
      Open project <ChevronRightIcon class="h-4 w-4 ml-1" />
    </button>
  </RouterLink>
</template>
