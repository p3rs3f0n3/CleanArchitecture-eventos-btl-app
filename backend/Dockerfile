# syntax=docker/dockerfile:1

# ---- build: compila TypeScript a JS; acá SÍ necesitamos devDependencies ----
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# tsc necesita los tipos de @prisma/client ya generados (Cliente, Evento,
# Informe, etc. no existen hasta correr "generate") — sin esto el build
# tira TS2305 "no exported member" para cada modelo.
RUN npx prisma generate
RUN pnpm run build

# ---- runtime: solo dependencias de producción + el JS ya compilado ----
# node:22-slim (Debian) en vez de alpine: el motor de Prisma necesita
# openssl/glibc, y en alpine (musl) da problemas conocidos.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# node:22-slim no trae openssl — sin esto, Prisma no puede detectar la
# versión de libssl y el motor que descarga/usa queda adivinado a ciegas.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY prisma ./prisma
# prisma.config.ts vive en la raíz del backend, no dentro de prisma/ — sin
# copiarlo, "prisma migrate deploy" no tiene de dónde sacar el adapter de
# Postgres ni la datasource.url ("required in your Prisma config file").
COPY prisma.config.ts ./
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 3000

# "prisma migrate deploy" aplica las migraciones pendientes ANTES de levantar
# el server — necesario porque en un despliegue de cero la base está vacía
# (ver ARQUITECTURA.md, nota sobre uploads/: mismo criterio de "nada se
# pre-crea sola" aplica acá).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
