import { router } from '.';
import { projectRouter } from './procedures/project';
import { promptRouter } from './procedures/prompt';
import { userRouter } from './procedures/user';
import { chainRouter } from './procedures/chain';
import { userFolderRouter } from './procedures/userFolder';

export const appRouter = router({
  prompt: promptRouter,
  project: projectRouter,
  user: userRouter,
  chain: chainRouter,
  userFolder: userFolderRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
