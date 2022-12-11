import { NonIdealState } from '@blueprintjs/core';
import { useParams } from 'react-router-dom';
import { EditorContextProvider } from '../../hooks/useEditor';
import { trpc } from '../../lib/trpc';
import EditorLayout from '../EditorLayout';
import Main from '../main/Main';
import Side from '../sidebar/Side';
import Spinner from '../Spinner';

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
      <EditorLayout side={<Side />} main={<Main />} />
    </EditorContextProvider>
  );
}
