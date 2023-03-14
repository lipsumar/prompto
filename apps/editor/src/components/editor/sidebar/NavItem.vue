<script setup lang="ts">
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import {
  DocumentIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { computed, reactive, ref } from "vue";
import { useEditorStore } from "@/stores/editor";

const props = defineProps(["text", "type", "id"]);
const emit = defineEmits<{
  (e: "rename", opts: { id: string; value: string }): void;
  (e: "delete", opts: { id: string }): void;
}>();
const state = reactive({
  isMenuOpen: false,
  isRenaming: false,
  menuLeft: 0,
  menuTop: 0,
});
const input = ref<HTMLInputElement>();
const editorStore = useEditorStore();

const isActive = computed(
  () =>
    editorStore.activeElement?.type === props.type &&
    editorStore.activeElement?.id === props.id
);

function focusAndSelect(input: HTMLInputElement) {
  setTimeout(() => {
    input.focus();
    input.select();
  }, 2);
}

function toggleMenu(el: EventTarget | null) {
  if (!el) return;
  const liEl = (el as HTMLElement).closest("li");
  if (!liEl) return;

  state.menuTop = liEl.offsetTop;
  state.menuLeft = liEl.offsetLeft + liEl.offsetWidth;
  state.isMenuOpen = !state.isMenuOpen;
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
    <div
      class="group flex items-center w-full pl-1 py-1 rounded-lg cursor-pointer"
      :class="{
        'bg-slate-300': isActive,
        'text-slate-600': isActive,
        'hover:bg-slate-500': !isActive,
      }"
      @click="
        () => {
          editorStore.setActiveElement({ type: props.type, id: props.id });
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
                emit('rename', { id: props.id, value: input.value });
              }
            }
          "
        />
      </div>
      <button
        @click.stop="toggleMenu($event.target)"
        class="ml-auto hover:bg-slate-400 rounded p-1 mr-1 invisible group-hover:visible"
      >
        <EllipsisVerticalIcon class="w-4 h-4" />
      </button>
      <Teleport to="body">
        <div
          v-if="state.isMenuOpen"
          class="absolute w-48 z-10 bg-slate-50 p-1 border rounded-lg shadow-md text-slate-800 text-left"
          :style="{ left: `${state.menuLeft}px`, top: `${state.menuTop}px` }"
        >
          <button
            class="flex text-sm items-center px-2 py-1 hover:bg-slate-100 rounded-lg w-full"
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
            class="flex text-sm items-center px-2 py-1 hover:bg-slate-100 rounded-lg w-full"
            @click.stop="
              () => {
                state.isMenuOpen = false;
                emit('delete', { id: props.id });
              }
            "
          >
            <TrashIcon class="w-4 h4 mr-2" />
            Delete
          </button>
        </div>
      </Teleport>
    </div>
  </li>
</template>
