import { Card } from '@blueprintjs/core';
import { Prompt } from '../../hooks/useEditor';
import { trpc } from '../../lib/trpc';
import Spinner from '../Spinner';
import { PromptOutput } from './PromptPanel';

type OutputHistoryProps = {
  currentPrompt: Prompt;
};

export default function OutputHistory({ currentPrompt }: OutputHistoryProps) {
  const { data: outputs = [], isLoading } = trpc.prompt.outputs.useQuery({
    promptId: currentPrompt.id,
  });
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div>
      {outputs.map((output) => (
        <Card className="space-after">{output.content}</Card>
      ))}
    </div>
  );
}
