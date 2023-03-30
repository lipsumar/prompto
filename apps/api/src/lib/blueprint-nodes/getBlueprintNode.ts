import { TextCompleteNode } from './TextCompleteNode';
import { TextNode } from './TextNode';
import { BlueprintNode } from '@lipsumar/blueprintjs';
import { BlueprintNodeJSON, BlueprintPortJSON } from './types';
import { FunctionNode } from './FunctionNode';
import { DebugNode } from './DebugNode';
import { RepeatNode } from './RepeatNode';
import { ObjectNode } from './ObjectNode';
import { AddToFolderNode } from './AddToFolderNode';
import { ImageGeneratorNode } from './ImageGeneratorNode';
import { NeonDreamNode } from './NeonDreamNode';

const NodeByType: Record<string, typeof BlueprintNode> = {
  text: TextNode,
  'text-complete': TextCompleteNode,
  function: FunctionNode,
  debug: DebugNode,
  repeat: RepeatNode,
  object: ObjectNode,
  'add-to-folder': AddToFolderNode,
  'image-generator': ImageGeneratorNode,
  'neon-dream': NeonDreamNode,
};

export default function getBlueprintNode(jsonNode: BlueprintNodeJSON) {
  const NodeClass = NodeByType[jsonNode.type];
  const node = new NodeClass();
  node.selfInputs = { ...jsonNode.selfInputs };
  if (jsonNode.allowUserCreatedDataInputs) {
    jsonNode.dataInputs
      .filter((p) => p.userCreated)
      .forEach((port) => {
        node.registerDataInput(port);
      });
  }
  return node;
}
