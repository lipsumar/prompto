import Konva from "konva";
import type { BlueprintNodeJSON, BlueprintPort } from "api";
import type { Context } from "konva/lib/Context";
import type BlueprintGraph from ".";
import { colorByDataType } from "./constants";

export default class Node {
  group: Konva.Group;
  bg: Konva.Rect | null = null;
  node: BlueprintNodeJSON;
  currentInputY = 40;
  currentOutputY = 40;
  width = 250;
  height = 110;
  inputPositions: Record<string, number> = {};
  outputPositions: Record<string, number> = {};
  graph: BlueprintGraph;

  constructor(node: BlueprintNodeJSON, graph: BlueprintGraph) {
    this.node = node;
    this.graph = graph;
    this.group = new Konva.Group({
      x: node.x,
      y: node.y,
      draggable: true,
    });
    this.build();
  }

  build() {
    this.bg = new Konva.Rect({
      fill: "white",
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      cornerRadius: 8,
      stroke: "#94a3b8",
      strokeWidth: 1,
      shadowEnabled: true,
      shadowBlur: 8,
      shadowColor: "#000",
      shadowOpacity: 0.09,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    });
    this.group.add(this.bg);
    this.bg.on("dblclick", () => {
      this.graph.openInspector(this.node.id);
    });

    const title = new Konva.Text({
      text: this.node.type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      fontSize: 16,
      fontFamily: "BlinkMacSystemFont",
      fontStyle: "bold",
      x: 10,
      y: 10,
    });
    this.group.add(title);

    this.node.flowInputs.forEach((flowInput) => {
      this.addFlowInput(flowInput);
    });
    this.node.dataInputs.forEach((port) => {
      this.addDataInput(port);
    });
    this.node.flowOutputs.forEach((flowOutput) => {
      this.addFlowOutput(flowOutput);
    });
    this.node.dataOutputs.forEach((port) => {
      this.addDataOutput(port);
    });
    this.resize();
  }

  addFlowInput(key: string) {
    const arrow = new Konva.Shape({
      x: -8,
      y: this.currentInputY,
      stroke: "#000",
      strokeWidth: 1,
      fill: "#fff",
      sceneFunc: flowArrowSceneFunc,
    });
    this.group.add(arrow);
    this.addEdgeEndTarget(
      {
        x: 0,
        y: this.currentInputY + 10,
      },
      key
    );

    const text = new Konva.Text({
      text: key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: 20,
      y: this.currentInputY,
      height: 20,
      verticalAlign: "middle",
    });
    this.group.add(text);

    this.inputPositions[key] = this.currentInputY + 10;
    this.currentInputY += 35;
  }

  addFlowOutput(key: string) {
    const arrow = new Konva.Shape({
      x: this.width - 9,
      y: this.currentOutputY,
      stroke: "#000",
      strokeWidth: 1,
      fill: "#fff",
      sceneFunc: flowArrowSceneFunc,
    });
    this.group.add(arrow);
    this.addEdgeStartTarget(
      {
        x: this.width,
        y: this.currentOutputY + 10,
      },
      key
    );

    const text = new Konva.Text({
      text: key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: this.width - 20 - 50,
      y: this.currentOutputY,
      height: 20,
      width: 50,
      verticalAlign: "middle",
      align: "right",
    });
    this.group.add(text);

    this.outputPositions[key] = this.currentOutputY + 10;
    this.currentOutputY += 35;
  }

  addDataInput(port: BlueprintPort) {
    const circle = new Konva.Circle({
      x: 0,
      y: this.currentInputY + 10,
      radius: 7,
      stroke: colorByDataType[port.dataType],
      strokeWidth: 1.5,
      fill: "white",
    });
    this.group.add(circle);
    this.addEdgeEndTarget(
      {
        x: 0,
        y: this.currentInputY + 10,
      },
      port.key
    );

    const text = new Konva.Text({
      text: port.key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: 20,
      y: this.currentInputY,
      height: 20,
      verticalAlign: "middle",
    });
    this.group.add(text);

    this.inputPositions[port.key] = this.currentInputY + 10;
    this.currentInputY += 35;
  }

  addDataOutput(port: BlueprintPort) {
    const circle = new Konva.Circle({
      x: this.width,
      y: this.currentOutputY + 10,
      radius: 7,
      stroke: colorByDataType[port.dataType],
      strokeWidth: 1.5,
      fill: "white",
    });
    this.group.add(circle);
    this.addEdgeStartTarget(
      {
        x: this.width,
        y: this.currentOutputY + 10,
      },
      port.key
    );

    const text = new Konva.Text({
      text: port.key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: this.width - 20 - 50,
      y: this.currentOutputY,
      height: 20,
      width: 50,
      verticalAlign: "middle",
      align: "right",
    });
    this.group.add(text);

    this.outputPositions[port.key] = this.currentOutputY + 10;
    this.currentOutputY += 35;
  }

  addEdgeStartTarget(point: { x: number; y: number }, key: string) {
    const target = new Konva.Circle({
      x: point.x,
      y: point.y,
      radius: 13,
      draggable: true,
      fill: "red",
      opacity: 0,
    });
    this.group.add(target);
    const edge = {
      fromId: this.node.id,
      fromKey: key,
      toId: "_mouse",
      toKey: "_mouse",
    };
    target.on("dragstart", () => {
      this.graph.addEdge(edge);
    });
    target.on("dragend", () => {
      this.graph.removeEdge(edge);
      target.position(point);
      // we need to wait for the target to move out the way
      // before we can do getIntersection()
      setTimeout(() => {
        const pos = this.graph.stage.getPointerPosition();
        const shape = this.graph.nodeLayer.getIntersection(pos!);
        console.log(shape);
        if (shape) {
          console.log("fire edge-drop");
          shape.fire("edge-drop", { fromId: this.node.id, fromKey: key });
        }
      }, 10);
    });
  }

  addEdgeEndTarget(point: { x: number; y: number }, key: string) {
    const target = new Konva.Circle({
      x: point.x,
      y: point.y,
      radius: 13,
      draggable: true,
      fill: "green",
      opacity: 0,
    });
    this.group.add(target);
    target.on("edge-drop", ({ fromId, fromKey }: any) => {
      this.graph.addEdge({
        fromId,
        fromKey,
        toId: this.node.id,
        toKey: key,
      });
    });
  }

  setSelfInput(key: string, value: any) {
    this.node.selfInputs[key] = value;
  }

  resize() {
    const newHeight = Math.max(this.currentInputY, this.currentOutputY);
    this.bg!.height(newHeight);
    this.height = newHeight;
  }
}

function flowArrowSceneFunc(ctx: Context, shape: Konva.Shape) {
  const width = 15;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width + 5, 10);
  ctx.lineTo(width, 20);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}
