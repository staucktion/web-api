FROM node:23

WORKDIR /app

COPY package*.json ./

COPY prisma /app/prisma

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "run", "prod"]
