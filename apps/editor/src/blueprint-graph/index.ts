import Konva from "konva";
import type { BlueprintNodeJSON } from "api";
import Node from "./Node";

export default class BlueprintGraph {
  el: HTMLDivElement;
  stage: Konva.Stage;
  nodeLayer: Konva.Layer;
  nodes: Node[] = [];

  constructor(el: HTMLDivElement) {
    this.el = el;
    this.stage = new Konva.Stage({
      container: "konva-stage",
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
    this.nodeLayer = new Konva.Layer();
    this.stage.add(this.nodeLayer);
    this.fitStage();
    this.setupPanZoom();
  }

  addNode(node: BlueprintNodeJSON) {
    const uiNode = new Node(node);
    this.nodes.push(uiNode);
    this.nodeLayer.add(uiNode.group);
  }

  fitStage() {
    this.stage.width(this.el.offsetWidth);
    this.stage.height(this.el.offsetHeight);
  }

  setupPanZoom() {
    const stage = this.stage;
    stage.on("wheel", function (e) {
      // prevent parent scrolling
      e.evt.preventDefault();

      if (e.evt.ctrlKey) {
        // zoom
        const scaleBy = 1.03;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition()!;

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
          direction = -direction;
        }

        const newScale =
          direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
        return;
      }

      const dx = e.evt.deltaX;
      const dy = e.evt.deltaY;

      const x = stage.x() - dx;
      const y = stage.y() - dy;
      stage.position({ x, y });
    });
  }
}
