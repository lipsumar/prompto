import { Button, Icon } from '@blueprintjs/core';
import PromptTree from './PromptTree';
import SideTopBar from './SideTopBar';

export default function Side() {
  return (
    <>
      <SideTopBar />

      <PromptTree />
    </>
  );
}
