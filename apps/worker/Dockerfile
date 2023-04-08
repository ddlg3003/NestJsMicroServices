FROM node:16.15.0-alpine3.15 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16.15.0-alpine3.15 AS run
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production --omit=dev
COPY .env .
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3004
CMD ["npm", "run", "start-worker:prod"]

