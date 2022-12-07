import { NonIdealState } from '@blueprintjs/core';
import { useParams } from 'react-router-dom';
import { EditorContextProvider } from '../hooks/useProject';
import { trpc } from '../lib/trpc';
import AppLayout from './AppLayout';
import Side from './Side';
import Spinner from './Spinner';

export default function Editor() {
  const { projectId } = useParams();
  if (!projectId) {
    throw new Error('project id missing');
  }

  const { data: project, isLoading } = trpc.project.get.useQuery({
    id: projectId,
  });
  if (isLoading) return <Spinner />;
  if (!project) {
    return <NonIdealState title="Project not found" icon="search" />;
  }

  return (
    <EditorContextProvider project={project}>
      <AppLayout side={<Side />} main={<div>main</div>} />
    </EditorContextProvider>
  );
}
