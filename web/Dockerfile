FROM node:12.10-alpine

WORKDIR /gallery/web
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]