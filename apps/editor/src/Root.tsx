import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';

import React, { useState } from 'react';
import App from './components/App';
import { trpc } from './lib/trpc';

import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';

export function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${import.meta.env.VITE_API_URL}/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            }).then((resp) => {
              if (resp.status === 401) {
                window.location.href = import.meta.env.VITE_LOGIN_URL;
              }
              return resp;
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
