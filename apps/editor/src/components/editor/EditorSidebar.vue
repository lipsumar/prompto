<script setup lang="ts">
import {
  ArrowLeftIcon,
  DocumentPlusIcon,
  FolderOpenIcon,
} from "@heroicons/vue/20/solid";
</script>

<template>
  <div class="p-4 flex items-center">
    <ArrowLeftIcon class="w-4 h-4 mr-4" />
    <h1 class="uppercase text-sm font-bold tracking-wider text-slate-200">
      Project name
    </h1>
  </div>
  <div class="pr-4 pt-4">
    <div
      class="flex items-center justify-between ml-4 text-slate-200 border-b-2 border-b-slate-400 font-semibold"
    >
      Prompts
      <DocumentPlusIcon class="w-4 h-4 text-white" />
    </div>
    <ul class="mt-3">
      <li class="mb-2 pl-4">First prompt</li>
      <li class="mb-2 pl-4">Second prompt</li>
      <li class="mb-2 pl-4">Third prompt</li>
      <li class="mb-2 pl-4">
        <div class="flex items-center mb-2">
          <FolderOpenIcon class="w-4 h-4" />
          <div class="ml-2">Some folder</div>
        </div>
        <ul class="ml-4">
          <li class="mb-2 pl-4 bg-slate-300 text-slate-600 rounded-full">
            A nested prompt
          </li>
          <li class="mb-2 pl-4">Another prompt</li>
        </ul>
      </li>
    </ul>
  </div>
</template>
