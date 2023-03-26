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
      width: 40,
      height: 20,
    });
    this.group.add(runButton);

    this.group.add(
      new Konva.Text({
        text: "Run",
        fontFamily: "BlinkMacSystemFont",
        fontSize: 14,
        x: 16,
        y: 43,
        listening: false,
      })
    );

    const stage = this.graph.stage;
    runButton.on("mouseenter", function () {
      stage.container().style.cursor = "pointer";
    });

    runButton.on("mouseleave", function () {
      stage.container().style.cursor = "default";
    });

    runButton.on("click", () => {
      this.group.fire("bp:run");
    });
  }
}
