import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api";
// for some reason this import makes it all work
import type {} from "@trpc/server";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        }).then((resp) => {
          if (resp.status === 401) {
            window.location.href = import.meta.env.VITE_LOGIN_URL;
          }
          return resp;
        });
      },
    }),
  ],
});
