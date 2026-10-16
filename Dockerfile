FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts ./

RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build_db?schema=public" npx prisma generate

COPY src ./src

EXPOSE 3000

CMD ["node", "src/server.js"]