import { InputNodeOptions } from './nodes/input';
import { PromptNodeOptions } from './nodes/prompt';

export type LangDataType = 'string';
export type LangDataObject = { value: string; type: 'string' };
export type ApiInput = Record<string, LangDataObject>;
export type ExecuteFunctionContext = {
  apiInput: ApiInput;
  openaiApiKey?: string;
};

export type BaseSerializedLangNode = {
  id: string;
  inputs: Record<string, LangDataType>;
  outputs: Record<string, LangDataType>;
};

export type SerializedLangNode =
  | ({ type: 'output'; config?: undefined } & BaseSerializedLangNode)
  | ({ type: 'prompt'; config: PromptNodeOptions } & BaseSerializedLangNode)
  | ({
      type: 'input';
      config: InputNodeOptions;
    } & BaseSerializedLangNode);
