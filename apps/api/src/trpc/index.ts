import * as trpcExpress from '@trpc/server/adapters/express';
import { inferAsyncReturnType, initTRPC, TRPCError } from '@trpc/server';
import { User } from '@prisma/client';

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  user: res.locals.user as User,
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

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(isAuthed);
