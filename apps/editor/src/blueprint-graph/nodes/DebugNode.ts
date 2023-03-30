import type { BlueprintNodeJSON, BlueprintPort } from "api";
import Node from "../Node";
import { colorByDataType } from "../constants";
import Konva from "konva";
import type BlueprintGraph from "..";

export default class DebugNode extends Node {
  textField: Konva.Text | null = null;

  constructor(node: BlueprintNodeJSON, graph: BlueprintGraph) {
    super(node, graph);

    this.textField = new Konva.Text({
      x: 15,
      y: 75,
      width: this.width - 20,
      lineHeight: 1.3,
      text: "",
      listening: false,
    });
    this.textField.height("auto" as any);

    this.group.add(this.textField);
    this.resize();
  }

  addDataInput(port: BlueprintPort): void {
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
    this.inputPositions[port.key] = this.currentInputY + 10;
    this.currentInputY += 35;
  }

  setInput(key: string, value: any) {
    Node.prototype.setInput.call(this, key, value);
    const text = typeof value === "string" ? value : JSON.stringify(value);
    this.textField?.text(text);
    this.resize();
  }

  resize(): void {
    const newHeight = this.currentInputY + (this.textField?.height() || 0) + 10;
    this.height = newHeight;
    this.bg?.height(newHeight);
  }
}
