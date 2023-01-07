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
const panzoom = ref<SvgPanZoom.Instance & { zoomRect?: typeof zoomRect }>();
provide("panzoom", panzoom);

/**
 * Centers and zooms a rectangle
 * @param rect { left, right, top, bottom }
 * @param scale force zoom to a specific value (eg: 1)
 */
function zoomRect(
  rect: { left: number; right: number; top: number; bottom: number },
  opts: { scale: number | null } = { scale: null }
) {
  invariant(screen.value && panzoom.value);

  let scale = opts.scale;
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  if (!scale) {
    const dx = width / screen.value.clientWidth;
    const dy = height / screen.value.clientHeight;
    scale = 1 / Math.max(dx, dy);
  }
  const x =
    -rect.left * scale +
    ((screen.value.clientWidth / scale - width) / 2) * scale;
  const y =
    -rect.top * scale +
    ((screen.value.clientHeight / scale - height) / 2) * scale;
  panzoom.value.zoom(scale);
  panzoom.value.pan({ x, y });
}

defineExpose({ zoomRect });

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
});
</script>
