import { z } from 'zod';
import { authedProcedure, router } from '..';
import { gpt3Complete } from '../../lib/gpt3';
import { prisma } from '../../lib/prisma';

export const promptRouter = router({
  inProject: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const prompts = await prisma.prompt.findMany({
        where: { projectId: input.projectId },
        orderBy: { name: 'asc' },
      });
      return prompts;
    }),
  create: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => {
      const prompt = await prisma.prompt.create({
        data: {
          projectId: input.projectId,
          promptVersions: { create: [{ content: '' }] },
        },
        include: {
          promptVersions: true,
        },
      });
      return prompt;
    }),
  rename: authedProcedure
    .input(z.object({ promptId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.prompt.update({
        where: { id: input.promptId },
        data: { name: input.name },
      });
    }),
  get: authedProcedure.input(z.object({ id: z.string() })).query(({ input }) =>
    prisma.prompt.findUnique({
      where: { id: input.id },
    })
  ),
  submit: authedProcedure
    .input(z.object({ content: z.string(), promptVersionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.gpt3ApiToken) {
        throw new Error('MISSING_GPT3_TOKEN');
      }
      const promptVersion = await prisma.promptVersion.update({
        where: { id: input.promptVersionId },
        data: { content: input.content },
      });
      const completion = await gpt3Complete(
        input.content,
        ctx.user.gpt3ApiToken
      );
      const output = await prisma.promptOutput.create({
        data: { promptVersionId: promptVersion.id, content: completion || '' },
      });
      return { promptVersion, output };
    }),
  outputs: authedProcedure
    .input(z.object({ promptId: z.string() }))
    .query(async ({ input }) => {
      const promptVersions = await prisma.promptVersion.findMany({
        where: { promptId: input.promptId },
        select: { id: true },
      });
      const promptVersionIds = promptVersions.map((pv) => pv.id);
      return prisma.promptOutput.findMany({
        where: { promptVersionId: { in: promptVersionIds } },
      });
    }),
});
