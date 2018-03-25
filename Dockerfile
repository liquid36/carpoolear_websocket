ARG NODE_VERSION=8.9-alpine
FROM node:${NODE_VERSION}

ENV node_env=development 

WORKDIR /app

COPY package.json package-lock.json  ./

RUN npm install

COPY . .

EXPOSE 8890
CMD [ "npm", "start" ]