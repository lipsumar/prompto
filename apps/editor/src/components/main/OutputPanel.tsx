import { Tab, Tabs } from '@blueprintjs/core';
import { useState } from 'react';
import { Prompt } from '../../hooks/useEditor';
import CurrentOutput from './CurrentOutput';
import OutputHistory from './OutputHistory';
import type { PromptOutput } from './PromptPanel';

type OutputPanelProps = {
  currentOutput: PromptOutput | null;
  working: boolean;
  currentPrompt: Prompt;
};
export default function OutputPanel({
  currentOutput,
  working,
  currentPrompt,
}: OutputPanelProps) {
  const [selectedTab, setSelectedTab] = useState<string>('current');
  return (
    <Tabs
      selectedTabId={selectedTab}
      onChange={(newTabId) => setSelectedTab(newTabId as string)}
    >
      <Tab
        id="current"
        panel={
          <CurrentOutput currentOutput={currentOutput} working={working} />
        }
      >
        Current
      </Tab>
      <Tab id="history" panel={<OutputHistory currentPrompt={currentPrompt} />}>
        History
      </Tab>
    </Tabs>
  );
}
