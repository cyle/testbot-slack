FROM node:0.10
MAINTAINER your-name@tumblr.com
RUN mkdir /app
COPY package.json /app/
COPY bot.js /app/
COPY config.js /app/
RUN cd /app; npm install
CMD node /app/bot.js /app/config.js
