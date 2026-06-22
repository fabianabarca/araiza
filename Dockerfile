# syntax=docker/dockerfile:1

# ---- Build stage: install dependencies and build the Nuxt app ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Toolchain needed to build native modules (better-sqlite3, sharp).
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# Use the pnpm version pinned in package.json ("packageManager").
RUN npm install -g pnpm@10.28.2

# Copy the full source first: the "postinstall" script runs `nuxt prepare`,
# and the build compiles content/ into the Nitro output.
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# ---- Runtime stage: run the prebuilt Nitro server ----
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app

# The .output directory is self-contained: it bundles the server dependencies,
# including the native bindings compiled in the build stage (same base image).
COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
