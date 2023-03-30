import Konva from "konva";
import type { BlueprintNodeJSON, BlueprintPort, DataType } from "api";
import type { Context } from "konva/lib/Context";
import type BlueprintGraph from ".";
import { colorByDataType } from "./constants";
import invariant from "tiny-invariant";

export default class Node {
  group: Konva.Group;
  inputsGroup: Konva.Group;
  bg: Konva.Rect | null = null;
  state: Konva.Text | null = null;
  node: BlueprintNodeJSON;
  currentInputY = 40;
  currentOutputY = 40;
  width = 250;
  height = 110;
  inputPositions: Record<string, number> = {};
  outputPositions: Record<string, number> = {};
  graph: BlueprintGraph;
  inputs: Record<string, any> = {};

  constructor(node: BlueprintNodeJSON, graph: BlueprintGraph) {
    this.node = node;
    this.graph = graph;
    this.group = new Konva.Group({
      x: node.x,
      y: node.y,
      draggable: true,
    });
    this.inputsGroup = new Konva.Group();

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

    const state = new Konva.Text({
      text: "idle",
      fontSize: 12,
      width: 50,
      x: this.width - 55,
      y: 5,
      align: "right",
    });
    this.group.add(state);
    this.state = state;

    this.group.add(this.inputsGroup);
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
    this.inputsGroup.add(flowArrowShape(-8, this.currentInputY));
    this.addEdgeEndTarget(
      {
        x: 0,
        y: this.currentInputY + 10,
      },
      key
    );
    this.inputsGroup.add(inputText(key, this.currentInputY));
    this.inputPositions[key] = this.currentInputY + 10;
    this.currentInputY += 35;
  }

  addFlowOutput(key: string) {
    this.group.add(flowArrowShape(this.width - 9, this.currentOutputY));
    this.addEdgeStartTarget(
      {
        x: this.width,
        y: this.currentOutputY + 10,
      },
      key
    );
    this.group.add(outputText(key, this.width - 20 - 50, this.currentOutputY));
    this.outputPositions[key] = this.currentOutputY + 10;
    this.currentOutputY += 35;
  }

  addDataInput(port: BlueprintPort) {
    this.inputsGroup.add(
      inputOutputCircle(
        0,
        this.currentInputY + 10,
        colorByDataType[port.dataType]
      )
    );
    this.addEdgeEndTarget(
      {
        x: 0,
        y: this.currentInputY + 10,
      },
      port.key
    );
    this.inputsGroup.add(inputText(port.key, this.currentInputY));

    this.inputPositions[port.key] = this.currentInputY + 10;
    this.currentInputY += 35;
  }

  addDataOutput(port: BlueprintPort) {
    this.group.add(
      inputOutputCircle(
        this.width,
        this.currentOutputY + 10,
        colorByDataType[port.dataType]
      )
    );
    this.addEdgeStartTarget(
      {
        x: this.width,
        y: this.currentOutputY + 10,
      },
      port.key
    );
    this.group.add(
      outputText(port.key, this.width - 20 - 50, this.currentOutputY)
    );
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

  setInput(key: string, value: any) {
    this.inputs[key] = value;
  }

  setSelfInput(key: string, value: any) {
    this.node.selfInputs[key] = value;
  }

  createNewInput(key: string, dataType: DataType) {
    this.node.dataInputs.push({
      key,
      dataType,
      isArray: false,
      userCreated: true,
    });
    this.inputsGroup.destroyChildren();
    this.inputPositions = {};
    this.currentInputY = 40;
    this.node.flowInputs.forEach((flowInput) => {
      this.addFlowInput(flowInput);
    });
    this.node.dataInputs.forEach((port) => {
      this.addDataInput(port);
    });
    this.resize();
  }

  updateState(state: string) {
    invariant(this.state);
    this.state.text(state);
  }

  resize() {
    const newHeight = Math.max(this.currentInputY, this.currentOutputY);
    this.bg!.height(newHeight);
    this.height = newHeight;
  }
}

function flowArrowShape(x: number, y: number) {
  return new Konva.Shape({
    x,
    y,
    stroke: "#000",
    strokeWidth: 1,
    fill: "#fff",
    sceneFunc(ctx: Context, shape: Konva.Shape) {
      const width = 15;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width + 5, 10);
      ctx.lineTo(width, 20);
      ctx.lineTo(0, 20);
      ctx.closePath();
      ctx.fillStrokeShape(shape);
    },
  });
}

function inputText(text: string, y: number) {
  return new Konva.Text({
    text,
    fontFamily: "BlinkMacSystemFont",
    fontSize: 16,
    x: 20,
    y,
    height: 20,
    verticalAlign: "middle",
    listening: false,
  });
}

function outputText(text: string, x: number, y: number) {
  return new Konva.Text({
    text,
    fontFamily: "BlinkMacSystemFont",
    fontSize: 16,
    x,
    y,
    height: 20,
    width: 50,
    verticalAlign: "middle",
    align: "right",
    listening: false,
  });
}

function inputOutputCircle(x: number, y: number, color: string) {
  return new Konva.Circle({
    x,
    y,
    radius: 7,
    stroke: color,
    strokeWidth: 1.5,
    fill: "white",
  });
}
