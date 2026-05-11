FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY server.js .
COPY bot.js .
COPY index.html .
CMD ["sh", "-c", "node server.js & node bot.js"]