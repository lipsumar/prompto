import { z } from 'zod';
import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';

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
    .mutation(({ input }) => {
      return prisma.chain.delete({ where: { id: input.id } });
    }),
});
