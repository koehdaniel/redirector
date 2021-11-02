FROM node:10-alpine
COPY app.js .
COPY package.json .
RUN npm install

ENTRYPOINT ["npm", "start"]