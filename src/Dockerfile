FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Force fresh build by adding timestamp and clearing cache
RUN echo "Build timestamp: $(date)" && \
    rm -rf .next && \
    npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Пользователь без root (опционально)
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nextjs --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
