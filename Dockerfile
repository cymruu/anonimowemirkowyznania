FROM node:14-alpine as base

WORKDIR /src

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

FROM base as build-production
RUN npm ci

FROM build-production as production
RUN npm ci
RUN npm run build
CMD ["npm", "start"]

FROM build-production as development
RUN npm install
CMD ["npm", "run", "start:docker"]
