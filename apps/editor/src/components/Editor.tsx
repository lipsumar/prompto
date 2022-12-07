import { NonIdealState } from '@blueprintjs/core';
import { useParams } from 'react-router-dom';
import { EditorContextProvider } from '../hooks/useProject';
import { trpc } from '../lib/trpc';
import AppLayout from './AppLayout';
import Side from './Side';

export default function Editor() {
  const { projectId } = useParams();
  if (!projectId) {
    throw new Error('project id missing');
  }

  const { data: project } = trpc.project.get.useQuery({ id: projectId });
  if (!project) {
    return <NonIdealState title="Project not found" icon="search" />;
  }

  return (
    <EditorContextProvider project={project}>
      <AppLayout side={<Side />} main={<div>main</div>} />
    </EditorContextProvider>
  );
}
