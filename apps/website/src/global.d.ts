declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET_KEY: string;
      SITE_DOMAIN: string;
      EDITOR_URL: string;
    }
  }
}

export {};
