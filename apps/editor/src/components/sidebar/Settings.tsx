import { Button, Icon } from '@blueprintjs/core';
import { trpc } from '../../lib/trpc';

export default function Settings() {
  const apiKeyMutation = trpc.user.setApiKey.useMutation();
  function promptForToken() {
    const token = prompt('GPT3 API Token');
    if (token) {
      apiKeyMutation.mutateAsync({ apiKey: token }).then(() => {
        alert('Token set');
      });
    }
  }

  return (
    <div className="settings">
      <Button onClick={() => promptForToken}>
        <Icon icon="cog" />
      </Button>
    </div>
  );
}
