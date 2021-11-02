FROM node:10-alpine
copy app.js app.js
RUN npm run install

ENTRYPOINT ["npm", "start"]