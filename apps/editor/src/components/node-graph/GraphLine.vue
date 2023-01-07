<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ x1: number; y1: number; x2: number; y2: number }>();
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
</script>

<template>
  <path class="edge" :d="path" stroke="#0ea5e9" stroke-width="4" fill="none" />
</template>
