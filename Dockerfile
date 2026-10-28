# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Erhan Karahan portfolio — production image
#   target "runner"   : the Next.js server (standalone output, non-root)
#   target "migrator" : one-off tasks (migrations, seed, admin creation)
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts=false

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# One-off task image: has the full dependency tree and the TypeScript scripts.
FROM node:${NODE_VERSION} AS migrator
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY src/lib/db/schema ./src/lib/db/schema
USER node
CMD ["sh", "-c", "npx tsx scripts/migrate.ts && npx tsx scripts/seed.ts"]

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_TMP_DIR=/app/tmp
# ffmpeg/ffprobe validate and remux uploaded videos.
RUN apk add --no-cache ffmpeg tini \
 && addgroup -S -g 1001 nextjs && adduser -S -u 1001 -G nextjs nextjs \
 && mkdir -p /app/.next/cache /app/tmp && chown -R nextjs:nextjs /app
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/robots.txt || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
