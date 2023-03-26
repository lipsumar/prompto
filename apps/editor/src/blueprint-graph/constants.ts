import Node from "./Node";
import FunctionNode from "./nodes/FunctionNode";
import TextNode from "./nodes/TextNode";
import DebugNode from "./nodes/DebugNode";

export const colorByDataType = {
  string: "magenta",
  number: "green",
  flow: "black",
};

export const NodeByType: Record<string, typeof Node> = {
  _default: Node,
  text: TextNode,
  function: FunctionNode,
  debug: DebugNode,
};
