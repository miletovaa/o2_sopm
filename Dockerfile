# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

# Prisma's engines need OpenSSL to be present to detect the right version;
# without it they fall back to guessing, which prisma itself warns is
# unreliable across platforms.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# --- dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build (also used as the runtime image for one-off `prisma migrate
# deploy` / `prisma db seed` jobs, since those need the CLI + devDependencies
# that the slim `runner` image below intentionally doesn't carry) -----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runtime -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# LibreOffice headless is what actually converts uploaded .docx SOPs to PDF
# (see src/lib/pdf.ts) — the app shells out to `soffice` at runtime, so it
# has to be present in this image, not just at build time.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --create-home --home-dir /home/nextjs --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
