import express from 'express';
import path from 'path';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import authUser from './middlewares/auth-user';
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(authUser);
app.get('/', (req, res) => {
  res.render('index', { token: res.locals.verifiedToken });
});
app.use(authRouter);

export default app;
