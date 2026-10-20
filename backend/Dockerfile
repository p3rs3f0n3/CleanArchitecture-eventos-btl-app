# syntax=docker/dockerfile:1

# ---- build: compila TypeScript a JS; acá SÍ necesitamos devDependencies ----
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ---- runtime: solo dependencias de producción + el JS ya compilado ----
# node:22-slim (Debian) en vez de alpine: el motor de Prisma necesita
# openssl/glibc, y en alpine (musl) da problemas conocidos.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 3000

# "prisma migrate deploy" aplica las migraciones pendientes ANTES de levantar
# el server — necesario porque en un despliegue de cero la base está vacía
# (ver ARQUITECTURA.md, nota sobre uploads/: mismo criterio de "nada se
# pre-crea sola" aplica acá).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
