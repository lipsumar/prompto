<script setup lang="ts">
import { LockClosedIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { computed, ref } from "vue";

const props = defineProps<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  interactive: boolean;
}>();
const emits = defineEmits<{ (e: "interactive-clicked"): void }>();
const path = computed(() => {
  const { x1, y1, x2, y2 } = props;
  let p = `M ${x1},${y1} `;
  // add two horizontal control points
  const distX = x1 - x2;
  const c1 = { x: x1 - distX / 2, y: y1 };
  const c2 = { x: x2 + distX / 2, y: y2 };
  p += ` C ${c1.x},${c1.y} ${c2.x},${c2.y} `;
  p += `${x2} ${y2}`;
  return p;
});
const centerPos = computed(() => {
  const { x1, y1, x2, y2 } = props;
  const distX = x1 - x2;
  const distY = y1 - y2;
  return { x: x1 - distX / 2, y: y1 - distY / 2 };
});
const colorDefault = "#0ea5e9";
const colorHover = "#0369a1";
const color = ref(colorDefault);
const displayDeleteButton = ref(false);

function onMouseEnter() {
  if (!props.interactive) return;
  color.value = colorHover;
  displayDeleteButton.value = true;
}
function onMouseLeave() {
  if (!props.interactive) return;
  color.value = colorDefault;
  displayDeleteButton.value = false;
}
</script>

<template>
  <path :d="path" :stroke="color" stroke-width="4" fill="none" />
  <path
    v-if="interactive"
    :d="path"
    stroke="transparent"
    stroke-width="10"
    fill="none"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  />

  <circle
    v-if="interactive && displayDeleteButton"
    :cx="centerPos.x"
    :cy="centerPos.y"
    r="10"
    :fill="colorHover"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="emits('interactive-clicked')"
  />
</template>
