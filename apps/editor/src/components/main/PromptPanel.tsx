import { Button } from '@blueprintjs/core';
import { useState } from 'react';
import { Prompt } from '../../hooks/useEditor';
import { trpc } from '../../lib/trpc';
import PromptEditor from './PromptEditor';
import './PromptPanel.scss';

type PromptPanelOptions = {
  prompt: Prompt;
};

export default function PromptPanel({ prompt }: PromptPanelOptions) {
  const submitPrompt = trpc.prompt.submit.useMutation({
    onSuccess: () => {},
    onError(err) {
      if (err.message === 'MISSING_GPT3_TOKEN') {
        alert('You need to set a GPT3 API token');
      }
    },
  });
  const [text, setText] = useState(prompt.promptVersions[0].content || '');

  return (
    <div className="prompt-layout">
      <div className="prompt-layout__top">
        <PromptEditor body={text} onChange={(t) => setText(t)} />
      </div>
      <div className="prompt-layout__middle">
        <Button
          onClick={() => {
            submitPrompt.mutate({
              content: text,
              promptVersionId: prompt.promptVersions[0].id,
            });
          }}
        >
          Submit
        </Button>
      </div>
      <div className="prompt-layout__bottom"></div>
    </div>
  );
}
