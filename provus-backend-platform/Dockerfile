FROM node:22

ARG PORT

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE ${PORT}

CMD [ "npm", "run", "start:dev" ]
