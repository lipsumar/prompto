<script setup lang="ts">
import { useGraphEditorStore, type GraphNodeData } from "@/stores/graphEditor";
import invariant from "tiny-invariant";
import { computed, ref } from "vue";

const props = defineProps<{
  port: string;
  node: GraphNodeData;
  type: "input" | "output";
}>();
defineEmits<{ (e: "startConnect", evt: MouseEvent, port: string): void }>();
defineExpose<{ getOffset: () => { x: number; y: number }; port: string }>({
  getOffset() {
    invariant(outer.value);
    const el = outer.value;
    return {
      x:
        props.type === "input"
          ? el.offsetLeft - 18
          : el.offsetLeft + el.offsetWidth + 18,
      y:
        props.type === "input"
          ? el.offsetTop + el.offsetHeight / 2 + 1
          : el.offsetTop + el.offsetHeight / 2 + 1,
    };
  },
  port: props.port,
});
const editorStore = useGraphEditorStore();
const outer = ref<HTMLDivElement>();
const connectedEdges = computed(() =>
  editorStore.edges.filter(
    (edge) => edge[props.type === "output" ? "from" : "to"] === props.node.id
  )
);
const connected = computed(
  () =>
    !!connectedEdges.value.find(
      (e) => e[props.type === "output" ? "fromPort" : "toPort"] === props.port
    )
);
</script>
<template>
  <div
    class="relative"
    :class="{ 'text-right': props.type === 'output' }"
    ref="outer"
  >
    {{ props.port }}
    <div
      class="absolute right-0 top-0 h-full flex items-center"
      :class="{
        'right-0 mr-[-24px]': props.type === 'output',
        'left-0 ml-[-24px]': props.type === 'input',
      }"
    >
      <div
        class="rounded-full w-4 h-4 border-[3px] border-white hover:bg-sky-500"
        :class="{
          'bg-sky-500': connected,
          'bg-sky-100': !connected,
        }"
        @mousedown.prevent.stop="(e) => $emit('startConnect', e, port)"
      ></div>
    </div>
  </div>
</template>
