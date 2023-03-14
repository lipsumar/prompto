import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const userRouter = router({
  getCurrent: authedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  updateCurrent: authedProcedure
    .input(
      z.object({ gpt3ApiToken: z.string(), huggingFaceApiToken: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.user.update({
        data: {
          gpt3ApiToken: input.gpt3ApiToken,
          huggingFaceApiToken: input.huggingFaceApiToken,
        },
        where: { id: ctx.user.id },
      });
    }),
});
