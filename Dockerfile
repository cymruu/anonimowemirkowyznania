FROM node:14-alpine

WORKDIR /src

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

CMD ["npm", "start"]