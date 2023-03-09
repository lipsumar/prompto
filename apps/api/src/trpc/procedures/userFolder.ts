import { z } from 'zod';
import { authedProcedure, router } from '..';
import { prisma } from '../../lib/prisma';

export const userFolderRouter = router({
  inProject: authedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const userFolders = await prisma.userFolder.findMany({
        where: { projectId: input.projectId },
        orderBy: { name: 'asc' },
      });
      return userFolders;
    }),
  create: authedProcedure
    .input(z.object({ projectId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const userFolder = await prisma.userFolder.create({
        data: {
          projectId: input.projectId,
          name: input.name,
        },
      });
      return userFolder;
    }),
  rename: authedProcedure
    .input(z.object({ userFolderId: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.userFolder.update({
        where: { id: input.userFolderId },
        data: { name: input.name },
      });
    }),
  get: authedProcedure.input(z.object({ id: z.string() })).query(({ input }) =>
    prisma.userFolder.findUnique({
      where: { id: input.id },
    })
  ),
  getDataObjects: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.dataObjects.findMany({
        where: { userFolderId: input.id },
        orderBy: { createdAt: 'desc' },
      });
    }),
  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.dataObjects.deleteMany({
        where: { userFolderId: input.id },
      });
      return prisma.userFolder.delete({ where: { id: input.id } });
    }),
});
