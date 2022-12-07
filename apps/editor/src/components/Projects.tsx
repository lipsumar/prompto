import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../lib/trpc';

export default function Projects() {
  const {
    data: projects,
    isLoading,
    isError,
  } = trpc.project.forUser.useQuery();
  const navigate = useNavigate();
  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      navigate(`/project/${project.id}`);
    },
  });

  if (isLoading) return <Spinner />;
  if (isError) return <div>Error</div>;
  if (projects && projects.length === 0) {
    return (
      <NonIdealState
        title="You don’t have any projects yet"
        icon="folder-open"
        description="Create a project to get started"
        action={
          <Button
            intent="primary"
            text="Create project"
            onClick={() => createProject.mutate()}
            disabled={createProject.isLoading}
            loading={createProject.isLoading}
          />
        }
        children={
          createProject.error && (
            <p>
              Something went wrong!
              <br />
              {createProject.error?.message}
            </p>
          )
        }
      />
    );
  }
  return (
    <div>
      <ul>
        {projects?.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
