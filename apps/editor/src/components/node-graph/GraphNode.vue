<script setup lang="ts">
import type SvgPanZoom from "svg-pan-zoom";
import { onMounted, reactive, ref, inject, type Ref } from "vue";

import invariant from "tiny-invariant";
import { useGraphEditorStore, type GraphNodeData } from "@/stores/graphEditor";
import { graph } from "@/vnodes";

const props = defineProps<{
  nodeId: GraphNodeData["id"];
}>();
const editorStore = useGraphEditorStore();
const contentRef = ref<HTMLElement>();
const inputRef = ref<HTMLElement[]>();
const outputRef = ref<HTMLElement[]>();
const margin = 15;
const panzoom = inject<Ref<SvgPanZoom.Instance>>("panzoom");

const drag = reactive({
  zoom: 1,
  active: false,
  prev: { x: 0, y: 0 },
  threshold: { x: 0, y: 0, crossed: false },
});

const node = editorStore.getNode(props.nodeId);
const box = reactive({ width: 0, height: 0 });

function fitContent() {
  invariant(contentRef.value);
  box.width = contentRef.value.offsetWidth;
  box.height = contentRef.value.offsetHeight;
  node.width = box.width;
  node.height = box.height;

  if (inputRef.value) {
    node.inputsOffset = inputRef.value.map((inputEl) => ({
      x: inputEl.offsetLeft - 18,
      y: inputEl.offsetTop + inputEl.offsetHeight / 2 + 1,
    }));
  }
  if (outputRef.value) {
    node.outputsOffset = outputRef.value.map((outputEl) => ({
      x: outputEl.offsetLeft + outputEl.offsetWidth + 18,
      y: outputEl.offsetTop + outputEl.offsetHeight / 2 + 1,
    }));
  }
}

function getEventClientPos(e: MouseEvent | TouchEvent) {
  let clientX = (e as MouseEvent).clientX;
  let clientY = (e as MouseEvent).clientY;
  if (e instanceof TouchEvent && e.touches && e.touches.length) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  return { clientX, clientY };
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
  >
    <div :style="`padding: ${margin}px;`">
      <div
        ref="contentRef"
        style="position: relative; white-space: nowrap; width: fit-content"
      >
        <div
          class="bg-white border border-sky-500 p-4 rounded-lg drop-shadow-md w-44 relative"
        >
          <div class="pb-2">
            <slot></slot>
          </div>
          <div
            class="relative"
            v-for="input of node.inputs"
            :key="input"
            ref="inputRef"
          >
            {{ input }}
            <div
              class="absolute left-0 top-0 h-full ml-[-24px] flex items-center"
            >
              <div
                class="rounded-full w-4 h-4 bg-sky-500 border-[3px] border-white"
              ></div>
            </div>
          </div>

          <div
            class="relative text-right"
            v-for="output of node.outputs"
            :key="output"
            ref="outputRef"
          >
            {{ output }}
            <div
              class="absolute right-0 top-0 h-full mr-[-24px] flex items-center"
            >
              <div
                class="rounded-full w-4 h-4 bg-sky-500 border-[3px] border-white"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </foreignObject>
</template>
