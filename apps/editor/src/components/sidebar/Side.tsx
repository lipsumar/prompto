import PromptTree from './PromptTree';
import Settings from './Settings';
import SideTopBar from './SideTopBar';

export default function Side() {
  return (
    <>
      <SideTopBar />
      <PromptTree />
      <Settings />
    </>
  );
}
