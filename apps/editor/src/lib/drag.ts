import { reactive } from "vue";

export function createDrag(opts: { maxThreshold?: number }) {
  const maxThreshold = opts.maxThreshold ?? 10;
  const drag = reactive({
    zoom: 1,
    prev: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    threshold: { x: 0, y: 0, crossed: false },
    onFinish: () => {},
  });

  function startDrag(opts: {
    pos: { x: number; y: number };
    client: { x: number; y: number };
    zoom: number;
    onFinish: () => void;
  }) {
    drag.zoom = opts.zoom;
    drag.prev = { ...opts.client };
    drag.pos = { ...opts.pos };
    drag.threshold = { x: 0, y: 0, crossed: false };
    drag.onFinish = opts.onFinish;

    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
    document.addEventListener("mousemove", applyDrag);
    document.addEventListener("touchmove", applyDrag);
  }

  function applyDrag(e: MouseEvent | TouchEvent) {
    const { clientX, clientY } = getEventClientPos(e);

    let x = (clientX - drag.prev.x) / drag.zoom;
    let y = (clientY - drag.prev.y) / drag.zoom;
    drag.prev = { x: clientX, y: clientY };

    if (!drag.threshold.crossed) {
      if (
        Math.abs(drag.threshold.x) < maxThreshold &&
        Math.abs(drag.threshold.y) < maxThreshold
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
    drag.pos.x += x;
    drag.pos.y += y;
    console.log(drag.pos);
  }

  function stopDrag() {
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchend", stopDrag);
    document.removeEventListener("mousemove", applyDrag);
    document.removeEventListener("touchmove", applyDrag);
    drag.onFinish();
  }

  return { drag, startDrag };
}

export function getEventClientPos(e: MouseEvent | TouchEvent) {
  let clientX = (e as MouseEvent).clientX;
  let clientY = (e as MouseEvent).clientY;
  if (e instanceof TouchEvent && e.touches && e.touches.length) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  return { clientX, clientY };
}
