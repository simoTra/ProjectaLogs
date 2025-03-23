FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && cd dashboard && npm ci && npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY package.json .
RUN npm install sqlite3 --save

RUN mkdir -p /home/app/data && \
    touch /home/app/data/projectalogs-db.sqlite && \
    chmod 666 /home/app/data/projectalogs-db.sqlite

EXPOSE 3000

CMD ["node", "dist/main.js"]
