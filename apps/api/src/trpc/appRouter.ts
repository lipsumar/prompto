import { router } from '.';
import { projectRouter } from './procedures/project';
import { promptRouter } from './procedures/prompt';
import { userRouter } from './procedures/user';

export const appRouter = router({
  prompt: promptRouter,
  project: projectRouter,
  user: userRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
