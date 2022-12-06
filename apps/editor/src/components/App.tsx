import { trpc } from '../lib/trpc';
import { Button } from '@blueprintjs/core';
import AppLayout from './AppLayout';
import Side from './Side';

export default function App() {
  // const hello = trpc.hello.useQuery();
  // if (!hello.data) return <div>Loading...</div>;
  return <AppLayout side={<Side />} main={<div>main</div>} />;
}
