import { createContext, useContext, useState } from 'react';
import { AppRouter } from 'api';

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Project = Exclude<RouterOutput['project']['get'], null>;
type Prompts = RouterOutput['prompt']['inProject'];
export type Prompt = Prompts[0];

const EditorContext = createContext<{
  project: Project;
  setCurrentPrompt: (prompt?: Prompt) => void;
  prompts: Prompts;
  setPrompts: (prompts: Prompts) => void;
  currentPrompt?: Prompt;
  getPromptById: (id: string) => Prompt | undefined;
  addPrompt: (prompt: Prompt) => void;
}>({
  project: {
    createdAt: '',
    id: '',
    name: '',
    updatedAt: '',
    userId: '',
  },
  prompts: [],
  setPrompts: () => {},
  setCurrentPrompt: () => {},
  getPromptById: () => undefined,
  addPrompt: () => undefined,
});

export function useEditor() {
  return useContext(EditorContext);
}

type EditorContextProviderProps = {
  children: JSX.Element;
  project: Project;
};
export function EditorContextProvider({
  children,
  project,
}: EditorContextProviderProps) {
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | undefined>(
    undefined
  );
  const [prompts, setPrompts] = useState<Prompts>([]);

  function getPromptById(id: string) {
    return prompts.find((p) => p.id === id);
  }

  function addPrompt(prompt: Prompt) {
    prompts.push(prompt);
  }

  return (
    <EditorContext.Provider
      value={{
        project,
        currentPrompt,
        setCurrentPrompt,
        prompts,
        setPrompts,
        getPromptById,
        addPrompt,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
