import { Button, Icon } from '@blueprintjs/core';
import { useEditor } from '../hooks/useProject';
import './SideTopBar.scss';

export default function SideTopBar() {
  const { project } = useEditor();
  return (
    <div className="side-top-bar">
      <div className="side-top-bar__title">{project.name.toLowerCase()}</div>
      <div>
        <Button minimal={true} small={true}>
          <Icon icon="document" />
        </Button>
      </div>
    </div>
  );
}
