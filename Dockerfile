# Frontend

FROM node:12.10-alpine as web
WORKDIR /gallery/web
COPY web/package.json ./
COPY web/yarn.lock ./
RUN yarn install --production
COPY web/ ./
RUN yarn build

# Backend

FROM node:12.10-alpine
WORKDIR /gallery/server
COPY server/package.json ./
COPY server/yarn.lock ./
RUN yarn install --production
COPY server/ ./
COPY --from=web /gallery/web/build/ /gallery/server/public
COPY server/cron/gallery-daily-cron-task /etc/periodic/daily
RUN SERVER_ROOT=/gallery/server /gallery/server/cron/install-seed-data.sh
ENV PORT 80
EXPOSE 80

# Boot
CMD [ "node", "src/app.js" ]