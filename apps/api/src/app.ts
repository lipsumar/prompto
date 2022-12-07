import express from 'express';
import cookieParser from 'cookie-parser';
import authUser from './middlewares/auth-user';
import cors from 'cors';

import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/appRouter';
import { createContext } from './trpc';

const app = express();

function getCors() {
  return cors({ origin: process.env.CORS_ALLOW_ORIGIN, credentials: true });
}
app.use(getCors());
app.options('*', getCors());
app.use(cookieParser());

app.use(authUser);
app.get('/', (req, res) => {
  res.send({ hello: 'api', verifiedToken: res.locals.verifiedToken });
});
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
