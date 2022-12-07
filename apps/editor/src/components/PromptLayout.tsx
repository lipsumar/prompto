import { Button, NonIdealState } from '@blueprintjs/core';
import { useState } from 'react';
import { useEditor } from '../hooks/useProject';
import { trpc } from '../lib/trpc';
import Prompt from './Prompt';
import './PromptLayout.scss';
export default function PromptLayout() {
  const { currentPromptId } = useEditor();
  const { data: currentPrompt } = trpc.prompt.get.useQuery(
    {
      id: currentPromptId!,
    },
    {
      enabled: typeof currentPromptId !== 'undefined',
      onSuccess: (data) => {
        if (!data) return;
        setText(data.promptVersions[0].content);
      },
    }
  );
  const submitPrompt = trpc.prompt.submit.useMutation();
  const [text, setText] = useState(
    currentPrompt?.promptVersions[0].content || ''
  );
  if (!currentPrompt) {
    return <div></div>;
  }

  return (
    <div className="prompt-layout">
      <div className="prompt-layout__top">
        <Prompt body={text} onChange={(t) => setText(t)} />
      </div>
      <div className="prompt-layout__middle">
        <Button
          onClick={() =>
            submitPrompt.mutate({
              content: text,
              promptVersionId: currentPrompt.promptVersions[0].id,
            })
          }
        >
          Submit
        </Button>
      </div>
      <div className="prompt-layout__bottom"></div>
    </div>
  );
}
