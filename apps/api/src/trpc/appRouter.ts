import { router } from '.';
import { projectRouter } from './procedures/project';
import { promptRouter } from './procedures/prompt';

export const appRouter = router({
  prompt: promptRouter,
  project: projectRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
