import { Button, Icon } from '@blueprintjs/core';
import { useEditor } from '../../hooks/useEditor';
import { trpc } from '../../lib/trpc';
import './SideTopBar.scss';

export default function SideTopBar() {
  const { project, addPrompt, setCurrentPrompt } = useEditor();
  const trpcCtx = trpc.useContext();
  const createPrompt = trpc.prompt.create.useMutation({
    onSuccess: (newPrompt) => {
      addPrompt(newPrompt);
      setCurrentPrompt(newPrompt);
    },
  });
  return (
    <div className="side-top-bar">
      <div className="side-top-bar__title">{project.name.toLowerCase()}</div>
      <div>
        <Button
          minimal={true}
          small={true}
          onClick={() => createPrompt.mutate({ projectId: project.id })}
        >
          <Icon icon="document" />
        </Button>
      </div>
    </div>
  );
}
