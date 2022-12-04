declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET_KEY: string;
      CORS_ALLOW_ORIGIN: string;
    }
  }
}

export {};
