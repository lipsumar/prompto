import { z } from 'zod';
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  token: res.locals.verifiedToken,
});
type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx: {
      // Infers the `token` as non-nullable
      token: ctx.token,
    },
  });
});

export const appRouter = t.router({
  hello: t.procedure.query(({ ctx }) => {
    return 'oh hi RPC! ' + JSON.stringify(ctx);
  }),
  authOnly: t.procedure.use(isAuthed).query(() => {
    return 'you’re in';
  }),
  // getUser: t.procedure.input(z.string()).query((req) => {
  //   req.input; // string
  //   return { id: req.input, name: 'Bilbo' };
  // }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
