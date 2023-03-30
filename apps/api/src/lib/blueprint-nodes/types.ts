import { BlueprintPort, DataType } from '@lipsumar/blueprintjs';

export type BlueprintPortJSON = BlueprintPort & {
  userCreated?: boolean;
};

// @todo extend base type from blueprint?
export type BlueprintNodeJSON = {
  id: string;
  type: string;
  x: number;
  y: number;
  flowInputs: string[];
  flowOutputs: string[];
  dataInputs: BlueprintPortJSON[];
  dataOutputs: BlueprintPort[];
  selfInputs: Record<string, any>;
  allowUserCreatedDataInputs?: DataType[];
};

export {
  BlueprintPort,
  BlueprintNode,
  BlueprintEdge,
  DataType,
} from '@lipsumar/blueprintjs';

export type NodeSchema = {
  type: string;
  flowInputs: string[];
  flowOutputs: string[];
  dataInputs: BlueprintPort[];
  dataOutputs: BlueprintPort[];
};
