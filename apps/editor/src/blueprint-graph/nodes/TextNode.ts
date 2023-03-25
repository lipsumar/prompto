import type { BlueprintNodeJSON, BlueprintPort } from "api";
import Node from "../Node";
import { colorByDataType } from "../constants";
import Konva from "konva";
import type BlueprintGraph from "..";

export default class TextNode extends Node {
  textField: Konva.Text | null = null;

  constructor(node: BlueprintNodeJSON, graph: BlueprintGraph) {
    super(node, graph);

    this.textField = new Konva.Text({
      x: 12,
      y: 40,
      width: this.width - 20,
      lineHeight: 1.3,
      text: this.node.selfInputs.text || "",
      listening: false,
    });
    this.textField.height("auto" as any);

    this.group.add(this.textField);
    this.resize();
  }

  setSelfInput(key: string, value: any): void {
    Node.prototype.setSelfInput.call(this, key, value);
    this.textField?.text(this.node.selfInputs.text);
    this.resize();
  }

  addDataInput(port: BlueprintPort): void {
    // const circle = new Konva.Circle({
    //   x: 0,
    //   y: this.currentInputY,
    //   radius: 7,
    //   stroke: colorByDataType[port.dataType],
    //   strokeWidth: 1.5,
    //   fill: "white",
    // });
    // this.group.add(circle);
    // this.addEdgeEndTarget(
    //   {
    //     x: 0,
    //     y: this.currentInputY + 10,
    //   },
    //   port.key
    // );
    // this.inputPositions[port.key] = this.currentInputY;
    // this.currentInputY += 35;
  }
  addDataOutput(port: BlueprintPort): void {
    const circle = new Konva.Circle({
      x: this.width,
      y: this.currentOutputY,
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

    this.outputPositions[port.key] = this.currentOutputY;
    this.currentOutputY += 35;
  }

  resize(): void {
    const newHeight = 40 + (this.textField?.height() || 0) + 10;
    this.height = newHeight;
    this.bg?.height(newHeight);
  }
}
