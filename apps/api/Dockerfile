FROM node:18.2
RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./
COPY apps/api/package.json ./apps/api/package.json


RUN pnpm recursive install

COPY apps/api ./apps/api

EXPOSE 3000
RUN pnpm nx run api:build
CMD [ "pnpm", "start:api" ]
