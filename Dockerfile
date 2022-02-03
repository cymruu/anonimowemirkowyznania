FROM node:14-alpine

WORKDIR /src

COPY package.json .
COPY package-lock.json .

FROM base as build-production
RUN npm ci --only=prod
COPY . .

FROM build-production as production
RUN npm run build
CMD ["npm", "start"]

FROM build-production as development
RUN npm install
CMD ["npm", "run", "start:docker"]
