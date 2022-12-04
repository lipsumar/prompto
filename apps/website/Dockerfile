FROM node:18.2
RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json ./
COPY apps/website/package.json ./apps/website/package.json


RUN pnpm recursive install

COPY apps/website ./apps/website

EXPOSE 3000
RUN pnpm nx run website:build
CMD [ "pnpm", "start:website" ]
