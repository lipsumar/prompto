import { z } from 'zod';
import { authedProcedure, router } from '..';
import { gpt3Complete } from '../../lib/gpt3';
import { prisma } from '../../lib/prisma';
import { createHash } from 'crypto';

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
  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      // @todo - also delete versions and outputs?
      return prisma.prompt.delete({ where: { id: input.id } });
    }),
  versions: authedProcedure
    .input(z.object({ promptId: z.string() }))
    .query(async ({ input }) => {
      return prisma.promptVersion.findMany({
        where: { promptId: input.promptId },
        orderBy: { createdAt: 'desc' },
      });
    }),
  submit: authedProcedure
    .input(
      z.object({
        content: z.string(),
        promptId: z.string(),
        temperature: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.gpt3ApiToken) {
        throw new Error('MISSING_GPT3_TOKEN');
      }

      let lastPromptVersion = await prisma.promptVersion.findFirst({
        where: { promptId: input.promptId },
        orderBy: { createdAt: 'desc' },
      });
      if (!lastPromptVersion) {
        lastPromptVersion = await prisma.promptVersion.create({
          data: {
            content: input.content,
            promptId: input.promptId,
          },
        });
      }
      const lastHash = createHash('sha256')
        .update(lastPromptVersion.content)
        .digest('hex');
      const currentHash = createHash('sha256')
        .update(input.content)
        .digest('hex');

      let promptVersion = lastPromptVersion;
      if (lastHash !== currentHash) {
        promptVersion = await prisma.promptVersion.create({
          data: {
            content: input.content,
            promptId: input.promptId,
            previousVersionId: lastPromptVersion.id,
          },
        });
      }

      const completion = await gpt3Complete(
        input.content,
        ctx.user.gpt3ApiToken,
        {
          temperature: input.temperature,
        }
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
        orderBy: { createdAt: 'desc' },
      });
    }),
});
