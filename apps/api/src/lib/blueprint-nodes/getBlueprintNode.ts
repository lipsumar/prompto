import { TextCompleteNode } from './TextCompleteNode';
import { TextNode } from './TextNode';
import { BlueprintNode } from '@lipsumar/blueprintjs';
import { BlueprintNodeJSON } from './types';
import { FunctionNode } from './FunctionNode';
import { DebugNode } from './DebugNode';
import { RepeatNode } from './RepeatNode';

const NodeByType: Record<string, typeof BlueprintNode> = {
  text: TextNode,
  'text-complete': TextCompleteNode,
  function: FunctionNode,
  debug: DebugNode,
  repeat: RepeatNode,
};

export default function getBlueprintNode(jsonNode: BlueprintNodeJSON) {
  const NodeClass = NodeByType[jsonNode.type];
  const node = new NodeClass();
  node.selfInputs = { ...jsonNode.selfInputs };
  return node;
}
