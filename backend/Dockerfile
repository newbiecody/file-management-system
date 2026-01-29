FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS development
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .

EXPOSE 4000

CMD ["pnpm", "dev"]

FROM base AS build
COPY --from=development /app /app
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
RUN pnpm install --prod

EXPOSE 4000
CMD ["node", "dist/index.js"]