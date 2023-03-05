import { z } from 'zod';
import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';
import { fromJSON as graphFromJSON } from 'langgraph';
import invariant from 'tiny-invariant';

export const chainRouter = router({
  inProject: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const chains = await prisma.chain.findMany({
        where: { projectId: input.projectId },
        orderBy: { name: 'asc' },
      });
      return chains;
    }),
  create: authedProcedure
    .input(z.object({ projectId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const chain = await prisma.chain.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          content: JSON.stringify({}),
        },
      });
      return chain;
    }),
  rename: authedProcedure
    .input(z.object({ chainId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.chain.update({
        where: { id: input.chainId },
        data: { name: input.name },
      });
    }),
  get: authedProcedure.input(z.object({ id: z.string() })).query(({ input }) =>
    prisma.chain.findUnique({
      where: { id: input.id },
    })
  ),
  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.chainRun.deleteMany({ where: { chainId: input.id } });
      return prisma.chain.delete({ where: { id: input.id } });
    }),
  update: authedProcedure
    .input(z.object({ content: z.string(), id: z.string() }))
    .mutation(({ input }) => {
      return prisma.chain.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),
  run: authedProcedure
    .input(
      z.object({ content: z.string(), id: z.string(), nodeId: z.string() })
    )
    .mutation(async ({ input, ctx }) => {
      const graph = graphFromJSON(JSON.parse(input.content));
      invariant(ctx.user.gpt3ApiToken, 'openAI API key must be set');
      await graph.executeNode(input.nodeId, {
        apiInput: {},
        openaiApiKey: ctx.user.gpt3ApiToken,
      });
      const prevRunsCount = await prisma.chainRun.count({
        where: { chainId: input.id },
      });
      return prisma.chainRun.create({
        data: {
          chainId: input.id,
          content: JSON.stringify(graph.executeResults),
          number: prevRunsCount + 1,
        },
      });
    }),
  getRuns: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.chainRun.findMany({
        where: { chainId: input.id },
        orderBy: { number: 'desc' },
      });
    }),
});
