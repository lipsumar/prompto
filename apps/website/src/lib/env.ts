import dotenv from 'dotenv-defaults';

dotenv.config();

['JWT_SECRET_KEY', 'SITE_DOMAIN', 'EDITOR_URL'].forEach((k) => {
  if (!process.env[k]) {
    throw new Error(k + ' missing');
  }
});
