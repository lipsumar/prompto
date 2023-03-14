<script setup lang="ts">
import {
  ArrowLeftIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { usePromptsStore } from "@/stores/prompts";
import { trpc } from "@/trpc";
import { RouterLink } from "vue-router";
import { ref } from "vue";
import { useChainsStore } from "@/stores/chains";
import { useEditorStore } from "@/stores/editor";
import PromptNavItem from "./sidebar/PromptNavItem.vue";
import ChainNavItem from "./sidebar/ChainNavItem.vue";
import { useUserFoldersStore } from "@/stores/userFolders";
import UserFolderNavItem from "./sidebar/UserFolderNavItem.vue";
import UserSection from "./sidebar/UserSection.vue";

const promptsStore = usePromptsStore();
const chainsStore = useChainsStore();
const userFoldersStore = useUserFoldersStore();
const editorStore = useEditorStore();
const projectNameRef = ref<HTMLInputElement | null>(null);

let projectName = ref(promptsStore.project?.name || "");

function createPrompt() {
  trpc.prompt.create
    .mutate({ projectId: promptsStore.projectId })
    .then((prompt) => {
      promptsStore.update();
      editorStore.setActiveElement({ type: "prompt", id: prompt.id });
    });
}

function createChain() {
  trpc.chain.create
    .mutate({
      projectId: promptsStore.projectId,
      name: "Untitled",
    })
    .then((chain) => {
      chainsStore.update();
      editorStore.setActiveElement({ type: "chain", id: chain.id });
    });
}

function createUserFolder() {
  trpc.userFolder.create
    .mutate({ projectId: promptsStore.projectId, name: "Untitled" })
    .then((userFolder) => {
      userFoldersStore.update();
      editorStore.setActiveElement({ type: "userFolder", id: userFolder.id });
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
  <div class="h-full flex flex-col">
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
    <div class="flex-1 overflow-y-auto">
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
          <PromptNavItem
            v-for="prompt of promptsStore.prompts"
            :key="prompt.id"
            :id="prompt.id"
            :text="prompt.name"
          />
        </ul>
      </div>
      <div class="pr-4 pt-2">
        <div class="flex items-center ml-4 text-sm text-slate-300">
          <div class="flex-1">Chains</div>
          <button
            class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
            @click="() => createChain()"
          >
            <PlusIcon class="w-4 h-4" />
          </button>
        </div>
        <ul class="mt-1">
          <ChainNavItem
            :text="chain.name"
            v-for="chain of chainsStore.chains"
            :key="chain.id"
            :id="chain.id"
          />
        </ul>
      </div>

      <div class="pr-4 pt-2">
        <div class="flex items-center ml-4 text-sm text-slate-300">
          <div class="flex-1">Folders</div>
          <button
            class="ml-1 p-1 flex items-center justify-center rounded hover:bg-slate-200 hover:text-slate-800 text-white"
            @click="() => createUserFolder()"
          >
            <PlusIcon class="w-4 h-4" />
          </button>
        </div>
        <ul class="mt-1">
          <UserFolderNavItem
            :text="chain.name"
            v-for="chain of userFoldersStore.userFolders"
            :key="chain.id"
            :id="chain.id"
          />
        </ul>
      </div>
    </div>
    <div>
      <UserSection />
    </div>
  </div>
</template>
