FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
RUN npm ci && npm --prefix server ci

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY shared ./shared
COPY server ./server
RUN npm run build --prefix server

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    RUNTIME_DATA_DIR=/app/runtime

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev && \
    npm --prefix server ci --omit=dev && \
    npm cache clean --force

COPY --from=build --chown=node:node /app/server/dist ./server/dist
RUN mkdir -p /app/runtime && chown node:node /app/runtime

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/dist/server/src/index.js"]
