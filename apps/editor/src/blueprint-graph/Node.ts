import Konva from "konva";
import type { BlueprintNodeJSON } from "api";
import type { Context } from "konva/lib/Context";

export default class Node {
  group: Konva.Group;
  node: BlueprintNodeJSON;
  currentInputY = 40;
  currentOutputY = 40;
  width = 250;
  height = 150;

  constructor(node: BlueprintNodeJSON) {
    this.node = node;
    this.group = new Konva.Group({
      x: node.x,
      y: node.y,
      draggable: true,
    });
    this.build();
  }

  build() {
    const bg = new Konva.Rect({
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
    this.group.add(bg);

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
    this.node.flowOutputs.forEach((flowOutput) => {
      this.addFlowOutput(flowOutput);
    });
  }

  addFlowInput(key: string) {
    const arrow = new Konva.Shape({
      x: -10,
      y: this.currentOutputY,
      stroke: "#000",
      strokeWidth: 1,
      fill: "#fff",
      sceneFunc: flowArrowSceneFunc,
    });
    this.group.add(arrow);

    const text = new Konva.Text({
      text: key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: 25,
      y: this.currentOutputY,
      height: 20,
      verticalAlign: "middle",
    });
    this.group.add(text);

    this.currentOutputY += 30;
  }

  addFlowOutput(key: string) {
    const arrow = new Konva.Shape({
      x: this.width - 12,
      y: this.currentInputY,
      stroke: "#000",
      strokeWidth: 1,
      fill: "#fff",
      sceneFunc: flowArrowSceneFunc,
    });
    this.group.add(arrow);

    const text = new Konva.Text({
      text: key,
      fontFamily: "BlinkMacSystemFont",
      fontSize: 16,
      x: this.width - 20 - 50,
      y: this.currentInputY,
      height: 20,
      width: 50,
      verticalAlign: "middle",
      align: "right",
    });
    this.group.add(text);

    this.currentInputY += 30;
  }
}

function flowArrowSceneFunc(ctx: Context, shape: Konva.Shape) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(20, 0);
  ctx.lineTo(25, 10);
  ctx.lineTo(20, 20);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}
