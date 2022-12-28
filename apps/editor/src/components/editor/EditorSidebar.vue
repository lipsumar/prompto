<script setup lang="ts">
import {
  ArrowLeftIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
} from "@heroicons/vue/24/outline";
import NavItem from "./sidebar/NavItem.vue";
import { usePromptsStore } from "@/stores/prompts";
import { trpc } from "@/trpc";
import { useCurrentPromptStore } from "@/stores/currentPrompt";
import { RouterLink } from "vue-router";
import { ref } from "vue";

const promptsStore = usePromptsStore();
const currentPromptStore = useCurrentPromptStore();
const projectNameRef = ref<HTMLInputElement | null>(null);

let projectName = ref(promptsStore.project?.name || "");

function createPrompt() {
  trpc.prompt.create
    .mutate({ projectId: promptsStore.projectId })
    .then((prompt) => {
      promptsStore.update();
      currentPromptStore.setPrompt(prompt.id);
    });
}

function saveProjectName() {
  trpc.project.rename
    .mutate({ id: promptsStore.projectId, name: projectName.value })
    .then(() => {
      projectNameRef.value?.blur();
    });
}
</script>

<template>
  <div class="p-4 pt-2 flex items-center">
    <RouterLink to="/"> <ArrowLeftIcon class="w-4 h-4 mr-2" /></RouterLink>
    <input
      type="text"
      class="w-full uppercase text-sm font-bold tracking-wider text-slate-200 bg-transparent outline outline-transparent rounded p-1 hover:outline-slate-300 focus:outline-slate-300"
      v-model="projectName"
      @keyup.enter="() => saveProjectName()"
      @focus="(e) => (e.target as HTMLInputElement).select()"
      ref="projectNameRef"
    />
  </div>
  <div class="pr-4 pt-2">
    <div class="flex items-center ml-4 text-sm text-slate-300">
      <div class="flex-1">Prompts</div>

      <!-- <button
        class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
      >
        <FolderPlusIcon class="w-4 h-4" />
      </button> -->
      <button
        class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
        @click="() => createPrompt()"
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
