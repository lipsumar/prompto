import dotenv from 'dotenv-defaults';

dotenv.config();

if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY missing');
}
