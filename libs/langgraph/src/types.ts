import { InputNodeOptions } from './nodes/input';
import { LlmNodeOptions } from './nodes/llm';
import { TextNodeOptions } from './nodes/text';

export type LangDataType = 'string' | 'image' | 'list';
export type LangDataObject =
  | { type: 'string'; value: string }
  | { type: 'image'; value: string }
  | { type: 'list'; value: string[] };
export type ApiInput = Record<string, LangDataObject>;
export type ExecuteFunctionContext = {
  apiInput: ApiInput;
  openaiApiKey?: string;
};

// deprecated
export type BaseSerializedLangNode = {
  id: string;
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
};
// deprecated
export type SerializedLangNode =
  | ({ type: 'output'; config?: undefined } & BaseSerializedLangNode)
  | ({ type: 'llm'; config: LlmNodeOptions } & BaseSerializedLangNode)
  | ({ type: 'text'; config: TextNodeOptions } & BaseSerializedLangNode)
  | ({
      type: 'input';
      config: InputNodeOptions;
    } & BaseSerializedLangNode);

export type ExecuteFunctionOutputs = Record<string, LangDataObject>;
export type ExecuteFunctionInputs = Record<string, LangDataObject>;
export type ExecuteFunction = (
  inputs: ExecuteFunctionInputs,
  ctx: ExecuteFunctionContext
) => Promise<ExecuteFunctionOutputs>;

export type ExecuteResult = {
  nodeId: string;
  inputs: ExecuteFunctionInputs;
  outputs: ExecuteFunctionOutputs;
};
export type ExecuteResults = ExecuteResult[];
