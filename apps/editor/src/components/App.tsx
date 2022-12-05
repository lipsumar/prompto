import { trpc } from '../lib/trpc';
export default function App() {
  const hello = trpc.hello.useQuery();
  if (!hello.data) return <div>Loading...</div>;
  return (
    <div>
      <p>{hello.data}</p>
    </div>
  );
}
