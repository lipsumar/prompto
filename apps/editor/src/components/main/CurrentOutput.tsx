import Spinner from '../Spinner';
import { PromptOutput } from './PromptPanel';

type CurrentOutputProps = {
  currentOutput: PromptOutput | null;
  working: boolean;
};

export default function CurrentOutput({
  currentOutput,
  working,
}: CurrentOutputProps) {
  if (working) {
    return <Spinner />;
  }
  if (!currentOutput) return <div></div>;
  return (
    <div className="bp4-running-text text-mono">{currentOutput.content}</div>
  );
}
