FROM node:18.2
RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./
COPY apps/editor/package.json ./apps/editor/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY libs/langgraph/package.json ./libs/langgraph/package.json
RUN pnpm recursive install

COPY apps/editor ./apps/editor
COPY apps/api ./apps/api
COPY libs/langgraph ./libs/langgraph

RUN cd apps/api && pnpm prisma generate
RUN pnpm nx run editor:build

FROM nginx:1.21
COPY --from=0 /usr/src/app/apps/editor/dist /usr/share/nginx/html
COPY --from=0 /usr/src/app/apps/editor/nginx.conf /etc/nginx/conf.d/default.conf
