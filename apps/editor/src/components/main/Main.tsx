import { useEditor } from '../../hooks/useEditor';
import PromptPanel from './PromptPanel';

export default function Main() {
  const { currentPrompt } = useEditor();
  if (!currentPrompt) {
    return <div></div>;
  }
  return <PromptPanel prompt={currentPrompt} key={currentPrompt.id} />;
}
