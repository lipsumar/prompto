<script setup lang="ts">
import type SvgPanZoom from "svg-pan-zoom";
import {
  onMounted,
  reactive,
  ref,
  inject,
  type Ref,
  computed,
  watch,
  nextTick,
} from "vue";
import { pickBy } from "lodash";
import invariant from "tiny-invariant";
import { useGraphEditorStore, type GraphNodeData } from "@/stores/graphEditor";

import { getEventClientPos } from "@/lib/drag";
import GraphPort from "./GraphPort.vue";
import { PlayIcon } from "@heroicons/vue/20/solid";
import SpinnerLoader from "../SpinnerLoader.vue";

const props = defineProps<{
  nodeId: GraphNodeData["id"];
}>();
const emit = defineEmits<{
  (
    e: "startConnect",
    opts: {
      port: string;
      pos: { x: number; y: number };
      client: { x: number; y: number };
      node: GraphNodeData;
    }
  ): void;
  (e: "delete"): void;
}>();
const editorStore = useGraphEditorStore();
const contentRef = ref<HTMLElement>();
const inputRef = ref<InstanceType<typeof GraphPort>[]>();
const defaultInputRef = ref<InstanceType<typeof GraphPort>>();
const defaultOutputRef = ref<InstanceType<typeof GraphPort>>();
const outputRef = ref<InstanceType<typeof GraphPort>[]>();
const margin = 15;
const panzoom = inject<Ref<SvgPanZoom.Instance>>("panzoom");
const additionalInputs = computed(
  () =>
    pickBy(node.inputs, (_, k) => k !== "default") as Record<string, "string">
);
const additionalOutputs = computed(
  () =>
    pickBy(node.outputs, (_, k) => k !== "default") as Record<string, "string">
);

const drag = reactive({
  zoom: 1,
  active: false,
  prev: { x: 0, y: 0 },
  threshold: { x: 0, y: 0, crossed: false },
});

const node = editorStore.getNode(props.nodeId);
const box = reactive({ width: 0, height: 0 });
const isSelected = computed(() => {
  return editorStore.selectedNode && editorStore.selectedNode.id === node.id;
});
if (node.config) {
  watch([node.config, node.inputs], () => {
    nextTick(() => fitContent());
  });
}

function fitContent() {
  invariant(contentRef.value);
  box.width = contentRef.value.offsetWidth;
  box.height = contentRef.value.offsetHeight;
  node.width = box.width;
  node.height = box.height;

  if (inputRef.value) {
    node.inputsOffset = inputRef.value.reduce((acc, inPort) => {
      acc[inPort.port] = inPort.getOffset();
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }
  node.inputsOffset.default = { x: 0, y: box.height / 2 };
  if (defaultInputRef.value) {
    defaultInputRef.value.$el.style.top = `${box.height / 2}px`;
  }
  if (outputRef.value) {
    node.outputsOffset = outputRef.value.reduce((acc, outPort) => {
      acc[outPort.port] = outPort.getOffset();
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }
  node.outputsOffset.default = { x: box.width, y: box.height / 2 };
  if (defaultOutputRef.value) {
    defaultOutputRef.value.$el.style.top = `${box.height / 2}px`;
    defaultOutputRef.value.$el.style.right = `${margin}px`;
  }
}

const dragThreshold = 10;
function startDrag(e: MouseEvent | TouchEvent) {
  invariant(panzoom?.value);
  drag.zoom = panzoom.value.getZoom();
  const { clientX, clientY } = getEventClientPos(e);
  drag.active = true;
  drag.prev = { x: clientX, y: clientY };
  drag.threshold = { x: 0, y: 0, crossed: false };

  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);
  document.addEventListener("mousemove", applyDrag);
  document.addEventListener("touchmove", applyDrag);
  document.addEventListener("click", preventClicks, true);
}
function stopDrag() {
  drag.active = false;
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchend", stopDrag);
  document.removeEventListener("mousemove", applyDrag);
  document.removeEventListener("touchmove", applyDrag);
}
function applyDrag(e: MouseEvent | TouchEvent) {
  const { clientX, clientY } = getEventClientPos(e);

  let x = (clientX - drag.prev.x) / drag.zoom;
  let y = (clientY - drag.prev.y) / drag.zoom;
  drag.prev = { x: clientX, y: clientY };

  if (!drag.threshold.crossed) {
    if (
      Math.abs(drag.threshold.x) < dragThreshold &&
      Math.abs(drag.threshold.y) < dragThreshold
    ) {
      drag.threshold.x += x;
      drag.threshold.y += y;
      return; // don't apply drag until threshold is reached
    } else {
      drag.threshold.crossed = true;
      x += drag.threshold.x;
      y += drag.threshold.y;
    }
  }
  node.x += x;
  node.y += y;
}
function preventClicks(e: Event) {
  if (drag.threshold.crossed) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    document.removeEventListener("click", preventClicks, true);
  }
}

function startConnect(
  side: "input" | "output",
  port: string,
  e: MouseEvent | TouchEvent
) {
  const clientPos = getEventClientPos(e);
  //const ports = side === "input" ? node.inputs : node.outputs;
  const portsOffset = side === "input" ? node.inputsOffset : node.outputsOffset;
  //const portIndex = Object.keys(ports).indexOf(port);
  const portOffset = portsOffset[port];
  const pos = { x: node.x + portOffset.x, y: node.y + portOffset.y };
  emit("startConnect", {
    port,
    pos,
    client: { x: clientPos.clientX, y: clientPos.clientY },
    node,
  });
}

function nodeClicked() {
  editorStore.selectNode(node.id);
}

onMounted(() => {
  fitContent();
});
</script>

<template>
  <foreignObject
    class="node"
    :x="node.x - margin"
    :y="node.y - margin"
    :width="box.width + margin * 2"
    :height="box.height + margin * 2"
    @mousedown.prevent.stop="startDrag"
    @touchstart.prevent.stop="startDrag"
    @click.stop="nodeClicked"
  >
    <div :style="`padding: ${margin}px;`">
      <div
        class="group"
        ref="contentRef"
        style="position: relative; white-space: nowrap; width: fit-content"
      >
        <div
          class="bg-white outline outline-sky-500 p-4 py-2 rounded-lg drop-shadow-md relative whitespace-normal"
          :class="{
            'outline-4': isSelected,
            // 'w-24': node.type === 'llm',
            // 'w-60': node.type !== 'llm',
            'w-60': ['text', 'image'].includes(node.type),
          }"
        >
          <div class="pb-1">
            <slot></slot>
          </div>
          <div
            class="absolute -top-2 -right-2 rounded-full bg-red-500 text-white items-center justify-center w-4 h-4 hidden group-hover:flex cursor-pointer opacity-50 hover:opacity-100"
            @click="emit('delete')"
          >
            ×
          </div>

          <div
            class="absolute top-0 right-0 bottom-0 left-0"
            v-if="node.status === 'running'"
          >
            <div
              class="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-60 rounded-lg"
            ></div>
            <div
              class="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center"
            >
              <SpinnerLoader />
            </div>
          </div>
          <GraphPort
            type="input"
            v-if="!!node.inputs.default"
            port="default"
            :node="node"
            @start-connect="(e) => startConnect('input', 'default', e)"
            ref="defaultInputRef"
          />
          <GraphPort
            v-for="(inputType, input) of additionalInputs"
            :key="input"
            type="input"
            ref="inputRef"
            :port="input"
            :node="node"
            @start-connect="(e) => startConnect('input', input, e)"
          />

          <GraphPort
            type="output"
            v-if="!!node.outputs.default"
            port="default"
            :node="node"
            @start-connect="(e) => startConnect('output', 'default', e)"
            ref="defaultOutputRef"
          />
          <GraphPort
            v-for="(outputType, output) of additionalOutputs"
            :key="output"
            type="output"
            ref="outputRef"
            :port="output"
            :node="node"
            @start-connect="(e) => startConnect('output', output, e)"
          />
        </div>
      </div>
    </div>
  </foreignObject>
</template>
