FROM node:18.19-alpine

WORKDIR /gallery/server
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . ./
EXPOSE 5000
CMD ["yarn", "start"]