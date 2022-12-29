import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { someFunc } from '../someType';

export const projectRouter = router({
  forUser: authedProcedure.query(({ ctx }) => {
    return prisma.project.findMany({
      where: { userId: ctx.user.id },
      orderBy: { updatedAt: 'desc' },
    });
  }),
  create: authedProcedure
    .input(
      z.object({ name: z.string().default('Untitled project') }).default({})
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.create({
        data: { userId: ctx.user.id, name: input.name },
      });
      return project;
    }),
  get: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) =>
      prisma.project.findUnique({ where: { id: input.id } })
    ),
  rename: authedProcedure
    .input(z.object({ name: z.string(), id: z.string() }))
    .mutation(({ input }) => {
      return prisma.project.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),
});
