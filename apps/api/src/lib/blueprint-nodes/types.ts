import { BlueprintPort } from '@lipsumar/blueprintjs';
// @todo extend base type from blueprint?
export type BlueprintNodeJSON = {
  id: string;
  type: string;
  x: number;
  y: number;
  flowInputs: string[];
  flowOutputs: string[];
  dataInputs: BlueprintPort[];
  dataOutputs: BlueprintPort[];
  selfInputs: Record<string, any>;
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
