FROM node:18.2
RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY libs/langgraph/package.json ./libs/langgraph/package.json


RUN pnpm recursive install


COPY apps/api ./apps/api
COPY libs/langgraph ./libs/langgraph
RUN cd apps/api && pnpm prisma generate

EXPOSE 4000
ENV NODE_ENV=production
RUN pnpm nx run api:build
CMD [ "pnpm", "start:api:prod" ]
