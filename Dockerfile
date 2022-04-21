FROM node:16-alpine

WORKDIR /src
COPY . .
RUN npm install
CMD ["npm", "run", "start:docker"]
