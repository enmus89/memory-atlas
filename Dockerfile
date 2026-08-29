# Portable image for Cloud Run, Railway, Fly, or anywhere that runs a container.
# Render does not need this — it builds natively from render.yaml.
#
# The server is bundled with its dependencies (npm run build:standalone), so
# the final image carries only the built assets and no node_modules at all.
#
# Vite inlines VITE_* values into the client bundle at BUILD time, so they are
# build arguments, not run-time environment variables. Passing them only at
# `docker run` yields a bundle with no Supabase credentials and an app that
# loads to the "not connected to a database" message.
#
#   docker build \
#     --build-arg VITE_SUPABASE_URL="https://xxxx.supabase.co" \
#     --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..." \
#     -t memory-atlas .
#
# The Gemini key is read by the server at run time and must NOT be baked in:
#
#   docker run -p 3000:3000 -e GEMINI_API_KEY="..." memory-atlas
#
# A build linter will flag the publishable key as a secret in an ARG. It is
# not one: it is designed to ship in the client bundle and is useless without
# a session, because every table is protected by row level security. The
# Supabase *secret* key must never appear here.

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Manifests first, so the dependency layer stays cached across source edits.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build:standalone

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Everything the server needs is inside this one directory.
COPY --from=build /app/dist ./dist

# Drop root. The node image ships an unprivileged `node` user.
USER node

# Informational only: the server binds whatever PORT the host injects, falling
# back to 3000. Cloud Run sets 8080.
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
