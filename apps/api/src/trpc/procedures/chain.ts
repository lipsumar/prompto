import { z } from 'zod';
import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';
import { ExecutionEngine, fromJSON as graphFromJSON } from 'langgraph';
import invariant from 'tiny-invariant';
import { sendEventToUser } from '../../middlewares/events';
import type { LangGraph } from 'langgraph';
import type { ChainRun, User } from '@prisma/client';
import type { ExecuteFunctionContext } from 'langgraph/dist/types';

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
      return runGraph(graph, ctx.user, input.id, {
        apiInput: {},
        openaiApiKey: ctx.user.gpt3ApiToken ?? undefined,
        folderStorage: {
          insert: async (folderId, dataObject) => {
            await prisma.dataObjects.create({
              data: {
                type: dataObject.type,
                value: JSON.stringify(dataObject.value),
                userFolderId: folderId,
              },
            });
          },
        },
      });
      //graph.on('step', broadcastStatus);
      // await graph.executeNode(input.nodeId, {
      //   apiInput: {},
      //   openaiApiKey: ctx.user.gpt3ApiToken,
      // });
      //graph.off('step', broadcastStatus);
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

async function runGraph(
  graph: LangGraph,
  user: User,
  chainId: string,
  ctx: ExecuteFunctionContext
): Promise<ChainRun> {
  function broadcastStatus(evt: {
    nodesStatus: { id: string; status: string }[];
  }) {
    console.log('broadcastStatus to', user.id);
    sendEventToUser(user.id, {
      nodesStatus: evt.nodesStatus,
      type: 'nodesStatus',
    });
  }

  const engine = new ExecutionEngine(graph);
  engine.on('step', broadcastStatus);

  return new Promise((resolve) => {
    engine.once('done', async () => {
      engine.off('step', broadcastStatus);

      const prevRunsCount = await prisma.chainRun.count({
        where: { chainId },
      });
      const chainRun = await prisma.chainRun.create({
        data: {
          chainId,
          content: JSON.stringify(engine.executeResults),
          number: prevRunsCount + 1,
        },
      });
      resolve(chainRun);
    });
    engine.execute(ctx);
  });
}
