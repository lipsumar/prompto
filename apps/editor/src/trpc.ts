import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "api";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type d = RouterOutput["project"]["forUser"];

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:4000/trpc",
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
trpc.project.forUser.query().then((reps) => {});
