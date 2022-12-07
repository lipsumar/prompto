import { z } from 'zod';
import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';

export const promptRouter = router({
  inProject: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const prompts = await prisma.prompt.findMany({
        where: { projectId: input.projectId },
        include: {
          promptVersions: true,
        },
      });
      return prompts;
    }),
  create: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      const prompt = await prisma.prompt.create({
        data: { projectId: input.projectId },
      });
      return prompt;
    }),
});
