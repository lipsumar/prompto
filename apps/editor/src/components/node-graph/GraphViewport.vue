<template>
  <svg class="w-full h-full" ref="screen">
    <g>
      <slot></slot>
    </g>
  </svg>
</template>

<script setup lang="ts">
import SvgPanZoom from "svg-pan-zoom";
import { onMounted, provide, ref } from "vue";
import invariant from "tiny-invariant";

const screen = ref<HTMLDivElement>();
const panzoom = ref<SvgPanZoom.Instance>();
provide("panzoom", panzoom);

onMounted(() => {
  invariant(screen.value);

  panzoom.value = SvgPanZoom(screen.value, {
    dblClickZoomEnabled: false,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    controlIconsEnabled:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
    fit: false,
    contain: false,
    center: false,
    zoomScaleSensitivity: 0.4,
    minZoom: 0.1,
    maxZoom: 5,
    // onZoom: (scale) => {},
    // onPan: (pan) => {},
    // onUserZoom: (e) => {},
    // onUserPan: (e) => {},
    // onDoubleClick: () => {},
    // onUpdatedCTM: (m) => {},
  });
  // panzoom.value.zoomRect = this.zoomRect;
  // panzoom.value.zoomNode = this.zoomNode;
  // panzoom.value.panNode = this.panNode;
});
</script>
