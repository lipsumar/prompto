import Konva from "konva";
import type { BlueprintEdge, BlueprintNodeJSON } from "api";
import Node from "./Node";
import invariant from "tiny-invariant";
import Edge from "./Edge";
import { isMatch } from "lodash";
import type { Vector2d } from "konva/lib/types";

type BlueprintGraphOptions = {
  onContextMenu: (pos: Vector2d, stagePos: Vector2d) => void;
  onClick: () => void;
};

export default class BlueprintGraph {
  el: HTMLDivElement;
  stage: Konva.Stage;
  nodeLayer: Konva.Layer;
  nodes: Node[] = [];
  edgeLayer: Konva.Layer;
  edges: Edge[] = [];

  constructor(el: HTMLDivElement, opts: BlueprintGraphOptions) {
    this.el = el;
    this.stage = new Konva.Stage({
      container: "konva-stage",
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
    this.nodeLayer = new Konva.Layer();
    this.edgeLayer = new Konva.Layer();
    this.stage.add(this.edgeLayer);
    this.stage.add(this.nodeLayer);
    this.fitStage();
    this.setupPanZoom();
    this.el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    this.stage.on("click", (e) => {
      if (e.evt.button === 2) {
        //right click
        const transform = this.stage.getAbsoluteTransform().copy();
        transform.invert();
        const point = transform.point(this.stage.getPointerPosition()!);
        opts.onContextMenu(this.stage.getPointerPosition()!, point);
      } else {
        opts.onClick();
      }
    });
  }

  addNode(node: BlueprintNodeJSON) {
    const uiNode = new Node(node, this);
    this.nodes.push(uiNode);
    this.nodeLayer.add(uiNode.group);
  }

  addEdge(edge: BlueprintEdge) {
    const fromNode = this.getNode(edge.fromId).node;
    const type = fromNode.flowOutputs.includes(edge.fromKey)
      ? "flow"
      : fromNode.dataOutputs.find((p) => p.key === edge.fromKey)!.dataType;
    const uiEdge = new Edge(edge, this, type);
    this.edges.push(uiEdge);
    this.edgeLayer.add(uiEdge.group);
  }

  removeEdge(edge: BlueprintEdge) {
    const index = this.edges.findIndex((e) => isMatch(e.edge, edge));
    invariant(index > -1);
    const uiEdge = this.edges[index];
    uiEdge.destroy();
    this.edges = this.edges.filter((e, i) => i !== index);
  }

  getNode(nodeId: string) {
    const node = this.nodes.find((n) => n.node.id === nodeId);
    invariant(node);
    return node;
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