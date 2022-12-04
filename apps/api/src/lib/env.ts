import dotenv from 'dotenv-defaults';

dotenv.config();

if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY missing');
}

if (!process.env.CORS_ALLOW_ORIGIN) {
  throw new Error('CORS_ALLOW_ORIGIN missing');
}
