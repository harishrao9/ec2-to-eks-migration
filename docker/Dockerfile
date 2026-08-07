FROM node:18-alpine

WORKDIR /app

COPY app/package.json .
RUN npm install --production

COPY app/ .

ENV PORT=3000
ENV APP_ENV=EKS
ENV APP_VERSION=1.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
