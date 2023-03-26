import type { BlueprintEdge, DataType } from "api";
import Konva from "konva";
import type BlueprintGraph from ".";
import { colorByDataType } from "./constants";

export default class Edge {
  line: Konva.Line;
  graph: BlueprintGraph;
  edge: BlueprintEdge;
  group: Konva.Group;
  deleteGroup: Konva.Group;
  uniqueId: string;
  type: string;

  constructor(
    edge: BlueprintEdge,
    graph: BlueprintGraph,
    type: DataType | "flow"
  ) {
    this.edge = edge;
    this.graph = graph;
    this.type = type;
    this.uniqueId = `${edge.fromId}.${edge.fromKey}-${edge.toId}.${edge.toKey}`;
    this.line = new Konva.Line({
      points: this.getPoints(),
      stroke: colorByDataType[type],
      strokeWidth: type === "flow" ? 4 : 2,
      hitStrokeWidth: 8,
      lineJoin: "round",
      bezier: true,
      //tension: 0.3,
    });
    this.group = new Konva.Group();
    this.group.add(this.line);

    this.deleteGroup = this.makeDeleteGroup();
    this.group.add(this.deleteGroup);

    const fromNode = graph.getNode(edge.fromId);
    fromNode.group.on(`dragmove.${this.uniqueId}`, () => {
      // weirdly, this also triggers when moving "EdgeStartTarget"
      this.updatePoints();
    });
    if (edge.toId !== "_mouse") {
      const toNode = graph.getNode(edge.toId);
      toNode.group.on(`dragmove.${this.uniqueId}`, () => {
        this.updatePoints();
      });
    }

    this.line.on("mouseenter", () => {
      this.placeDeleteGroup();
      this.deleteGroup.opacity(1);
    });
    this.line.on("mouseleave", () => {
      this.deleteGroup.opacity(0);
    });
    this.line.on("click", () => {
      if (this.deleteGroup.opacity() === 1) {
        this.graph.removeEdge(this.edge);
      }
    });
  }

  makeDeleteGroup() {
    const group = new Konva.Group({
      opacity: 0,
      listening: false,
    });
    const circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: "red",
    });
    group.add(circle);

    return group;
  }

  placeDeleteGroup() {
    const from = this.getFromPoint();
    const to = this.getToPoint();
    const distX = from.x - to.x;
    const distY = from.y - to.y;

    this.deleteGroup.position({ x: from.x - distX / 2, y: from.y - distY / 2 });
  }

  updatePoints() {
    this.line.points(this.getPoints());
  }

  getPoints() {
    const from = this.getFromPoint();
    const to = this.getToPoint();
    return [
      from.x,
      from.y,
      // from.x + 5,
      // from.y,

      // bezier control points
      from.x + (to.x - from.x) / 2,
      from.y,
      from.x + (to.x - from.x) / 2,
      to.y,

      // to.x - 5,
      // to.y,
      to.x,
      to.y,
    ];
  }

  getFromPoint() {
    const node = this.graph.getNode(this.edge.fromId);
    return {
      x: node.group.x() + node.width + 8,
      y: node.group.y() + node.outputPositions[this.edge.fromKey],
    };
  }
  getToPoint() {
    if (this.edge.toId === "_mouse") {
      const transform = this.graph.stage.getAbsoluteTransform().copy();
      transform.invert();
      const point = transform.point(this.graph.stage.getPointerPosition()!);
      return point;
    }
    const node = this.graph.getNode(this.edge.toId);
    return {
      x: node.group.x() - 8,
      y: node.group.y() + node.inputPositions[this.edge.toKey],
    };
  }

  destroy() {
    const fromNode = this.graph.getNode(this.edge.fromId);
    fromNode.group.off(`dragmove.${this.uniqueId}`);

    if (this.edge.toId !== "_mouse") {
      const toNode = this.graph.getNode(this.edge.toId);
      toNode.group.off(`dragmove.${this.uniqueId}`);
    }
    this.group.destroy();
  }
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}
