import { BlueprintNode, ExecutionContext } from '@lipsumar/blueprintjs';
import { NodeSchema } from './types';

export default function autoWireSchema(
  schema: NodeSchema,
  node: BlueprintNode,
  flowInputBindings: Record<string, (ctx: ExecutionContext) => void>
) {
  schema.flowInputs.forEach((key) => {
    node.registerInputSignal(key, flowInputBindings[key]);
  });
  schema.flowOutputs.forEach((key) => {
    node.registerOutputSignal(key);
  });
  schema.dataInputs.forEach((port) => {
    node.registerDataInput(port);
  });
  schema.dataOutputs.forEach((port) => {
    node.registerDataOutput(port);
  });
}
