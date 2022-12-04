import express from 'express';
import cookieParser from 'cookie-parser';
import authUser from './middlewares/auth-user';
import cors from 'cors';

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

export default app;
