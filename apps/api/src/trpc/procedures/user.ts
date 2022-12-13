import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const userRouter = router({
  setApiKey: authedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.user.update({
        data: { gpt3ApiToken: input.apiKey },
        where: { id: ctx.user.id },
      });
    }),
});
