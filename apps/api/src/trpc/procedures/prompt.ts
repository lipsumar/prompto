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
  get: authedProcedure.input(z.object({ id: z.string() })).query(({ input }) =>
    prisma.prompt.findUnique({
      where: { id: input.id },
      include: { promptVersions: true },
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
});
