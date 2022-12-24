<script setup lang="ts">
import {
  ArrowLeftIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
} from "@heroicons/vue/24/outline";
import NavItem from "./sidebar/NavItem.vue";
import { usePromptsStore } from "@/stores/prompts";

const promptsStore = usePromptsStore();
</script>

<template>
  <div class="p-4 flex items-center">
    <ArrowLeftIcon class="w-4 h-4 mr-4" />
    <h1 class="uppercase text-sm font-bold tracking-wider text-slate-200">
      Project name
    </h1>
  </div>
  <div class="pr-4 pt-2">
    <div class="flex items-center ml-4 text-sm text-slate-300">
      <div class="flex-1">Prompts</div>

      <button
        class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
      >
        <FolderPlusIcon class="w-4 h-4" />
      </button>
      <button
        class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
      >
        <DocumentPlusIcon class="w-4 h-4" />
      </button>
    </div>
    <ul class="mt-1">
      <NavItem
        :text="prompt.name"
        v-for="prompt of promptsStore.prompts"
        :key="prompt.id"
        :prompt-id="prompt.id"
      />

      <!-- <li class="mb-2 pl-4">
        <div class="flex items-center mb-2">
          <FolderOpenIcon class="w-4 h-4" />
          <div class="ml-2">Some folder</div>
        </div>
        <ul class="ml-4">
          <NavItem text="The active prompt" :isActive="true" />
          <NavItem text="Another prompt" />
        </ul>
      </li> -->
    </ul>
  </div>
</template>
