<script setup lang="ts">
import { trpc } from "@/trpc";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import {
  DocumentIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { computed, reactive, ref } from "vue";
import { useMutation } from "vue-query";
import type { AppRouter } from "api";
import type { inferRouterInputs } from "@trpc/server";
import { usePromptsStore } from "@/stores/prompts";
import { useCurrentPromptStore } from "@/stores/currentPrompt";

const props = defineProps(["text", "promptId"]);

const state = reactive({ isMenuOpen: false, isRenaming: false });
const input = ref<HTMLInputElement>();
const promptsStore = usePromptsStore();
const currentPromptStore = useCurrentPromptStore();

const isActive = computed(
  () => currentPromptStore.prompt?.id === props.promptId
);

const { mutate: renamePrompt } = useMutation(
  (data: inferRouterInputs<AppRouter>["prompt"]["rename"]) =>
    trpc.prompt.rename.mutate(data),
  {
    onSuccess() {
      promptsStore.update();
    },
  }
);

function focusAndSelect(input: HTMLInputElement) {
  setTimeout(() => {
    input.focus();
    input.select();
  }, 2);
}
</script>

<template>
  <li
    class="ml-4 relative mb-1"
    v-click-outside="
      () => {
        state.isMenuOpen = false;
        state.isRenaming = false;
      }
    "
  >
    <button
      class="group flex items-center w-full pl-1 py-1 rounded-lg"
      :class="{
        'bg-slate-300': isActive,
        'text-slate-600': isActive,
        'hover:bg-slate-500': !isActive,
      }"
      @click="
        () => {
          currentPromptStore.setPrompt(promptId);
        }
      "
    >
      <DocumentIcon class="w-4 h-4" />
      <div v-show="!state.isRenaming" class="ml-2">
        {{ text || "Untitled" }}
      </div>
      <div v-show="state.isRenaming" class="ml-2">
        <input
          type="text"
          :value="text"
          ref="input"
          class="bg-transparent w-full outline rounded outline-slate-400"
          @keyup.enter="
            () => {
              state.isRenaming = false;
              if (input) {
                renamePrompt({ promptId, name: input.value });
              }
            }
          "
        />
      </div>
      <button
        @click.stop="state.isMenuOpen = !state.isMenuOpen"
        class="ml-auto hover:bg-slate-400 rounded p-1 mr-1 invisible group-hover:visible"
      >
        <EllipsisVerticalIcon class="w-4 h-4" />
      </button>
      <div
        v-if="state.isMenuOpen"
        class="absolute bg-slate-50 p-1 border rounded-lg ml-[100%] top-0 w-48 shadow-md text-slate-800 text-left"
      >
        <button
          class="flex items-center px-2 py-1 hover:bg-slate-100 rounded-lg w-full"
          @click.stop="
            () => {
              state.isMenuOpen = false;
              state.isRenaming = true;
              if (input) focusAndSelect(input);
            }
          "
        >
          <PencilSquareIcon class="w-4 h4 mr-2" />
          Rename
        </button>
        <button
          class="flex items-center px-2 py-1 hover:bg-slate-100 rounded-lg w-full"
        >
          <TrashIcon class="w-4 h4 mr-2" />
          Delete
        </button>
      </div>
    </button>
  </li>
</template>
