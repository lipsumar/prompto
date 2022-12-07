import { prisma } from 'api/src/lib/prisma';
import { createContext, useContext } from 'react';
import { AppRouter } from 'api';

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Project = Exclude<RouterOutput['project']['get'], null>;

const EditorContext = createContext<{
  project: Project;
}>({
  project: {
    createdAt: '',
    id: '',
    name: '',
    updatedAt: '',
    userId: '',
  },
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
  return (
    <EditorContext.Provider value={{ project }}>
      {children}
    </EditorContext.Provider>
  );
}
