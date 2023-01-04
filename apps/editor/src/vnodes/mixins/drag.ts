/**
 * Adds drag behavior to Vue component
 * @drag event emmited
 */
export default {
  props: {
    dragThreshold: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      drag: {
        zoom: 1,
        active: false,
        prev: { x: 0, y: 0 },
        threshold: { x: 0, y: 0, crossed: false },
      },
    };
  },
  methods: {
    preventClicks(e: any) {
      if ((this as any).drag.threshold.crossed) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.removeEventListener("click", this.preventClicks, true);
      }
    },
    startDrag(e: any) {
      let parent = (this as any).$parent;
      while (parent) {
        if (parent.panzoom) {
          (this as any).drag.zoom = parent.panzoom.getZoom();
          break;
        }
        parent = parent.$parent;
      }
      // touch normalize
      if (e.touches && e.touches.length) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      }
      (this as any).drag.active = true;
      (this as any).drag.prev = { x: e.clientX, y: e.clientY };
      (this as any).drag.threshold = { x: 0, y: 0, crossed: false };
      document.addEventListener("mouseup", this.stopDrag);
      document.addEventListener("touchend", this.stopDrag);
      document.addEventListener("mousemove", this.applyDrag);
      document.addEventListener("touchmove", this.applyDrag);
      document.addEventListener("click", this.preventClicks, true);
    },
    stopDrag() {
      (this as any).drag.active = false;
      document.removeEventListener("mouseup", this.stopDrag);
      document.removeEventListener("touchend", this.stopDrag);
      document.removeEventListener("mousemove", this.applyDrag);
      document.removeEventListener("touchmove", this.applyDrag);
    },
    applyDrag(e: any) {
      if (e.touches && e.touches.length) {
        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;
      }
      let x = (e.clientX - (this as any).drag.prev.x) / (this as any).drag.zoom;
      let y = (e.clientY - (this as any).drag.prev.y) / (this as any).drag.zoom;
      (this as any).drag.prev = { x: e.clientX, y: e.clientY };

      if (!(this as any).drag.threshold.crossed) {
        if (
          Math.abs((this as any).drag.threshold.x) <
            (this as any).dragThreshold &&
          Math.abs((this as any).drag.threshold.y) < (this as any).dragThreshold
        ) {
          (this as any).drag.threshold.x += x;
          (this as any).drag.threshold.y += y;
          return; // don't apply drag until threshold is reached
        } else {
          (this as any).drag.threshold.crossed = true;
          x += (this as any).drag.threshold.x;
          y += (this as any).drag.threshold.y;
        }
      }
      (this as any).onDrag({ x, y });
    },
  },
  beforeDestroy() {
    document.removeEventListener("mousemove", (this as any).applyDrag);
    document.removeEventListener("mouseup", (this as any).stopDrag);
  },
};
