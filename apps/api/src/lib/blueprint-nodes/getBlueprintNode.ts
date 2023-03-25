import { TextCompleteNode } from './TextCompleteNode';
import { TextNode } from './TextNode';
import { BlueprintNode } from '@lipsumar/blueprintjs';
import { BlueprintNodeJSON } from './types';
import { FunctionNode } from './FunctionNode';

const NodeByType: Record<string, typeof BlueprintNode> = {
  text: TextNode,
  'text-complete': TextCompleteNode,
  function: FunctionNode,
};

export default function getBlueprintNode(jsonNode: BlueprintNodeJSON) {
  const NodeClass = NodeByType[jsonNode.type];
  const node = new NodeClass();
  node.selfInputs = { ...jsonNode.selfInputs };
  return node;
}
