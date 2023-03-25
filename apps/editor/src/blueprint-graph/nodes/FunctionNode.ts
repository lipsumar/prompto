import type { BlueprintNodeJSON } from "api";
import Node from "../Node";

import type BlueprintGraph from "..";
import Konva from "konva";

export default class FunctionNode extends Node {
  constructor(node: BlueprintNodeJSON, graph: BlueprintGraph) {
    super(node, graph);
    const runButton = new Konva.Rect({
      x: 10,
      y: 40,
      fill: "orange",
      width: 100,
      height: 20,
    });
    this.group.add(runButton);
    runButton.on("click", () => {
      this.group.fire("bp:run");
    });
  }
}
