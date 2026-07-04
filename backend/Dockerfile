# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

# Create uploads directory for local file storage
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]
