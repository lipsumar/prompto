import { prisma } from 'api/src/lib/prisma';
import { createContext, useContext, useState } from 'react';
import { AppRouter } from 'api';

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Project = Exclude<RouterOutput['project']['get'], null>;

const EditorContext = createContext<{
  project: Project;
  currentPromptId?: string;
  setCurrentPromptId: (promptId: string) => void;
}>({
  project: {
    createdAt: '',
    id: '',
    name: '',
    updatedAt: '',
    userId: '',
  },
  setCurrentPromptId: () => {},
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
  const [currentPromptId, setCurrentPromptId] = useState<string | undefined>(
    undefined
  );
  return (
    <EditorContext.Provider
      value={{ project, currentPromptId, setCurrentPromptId }}
    >
      {children}
    </EditorContext.Provider>
  );
}
