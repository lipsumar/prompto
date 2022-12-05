import { z } from 'zod';
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  user: res.locals.user,
});
type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return next({
    ctx: {
      // Infers the `user` as non-nullable
      user: ctx.user,
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
});

// export type definition of API
export type AppRouter = typeof appRouter;
