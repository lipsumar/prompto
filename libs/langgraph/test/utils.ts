import { ExecuteFunctionContext } from '../src/types';

export function createCtx(
  partialCtx: Partial<ExecuteFunctionContext> = {}
): ExecuteFunctionContext {
  return {
    folderStorage: {
      insert: async () => {},
    },
    apiInput: {},
    ...partialCtx,
  };
}
