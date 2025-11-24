FROM node:22

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-opensymbol \
    fonts-liberation \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG PORT

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE ${PORT}

CMD [ "npm", "run", "start:dev" ]
