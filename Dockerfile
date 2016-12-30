FROM node:7
MAINTAINER your-name@whatever.com
RUN mkdir /app
COPY package.json /app/
COPY bot.js /app/
COPY config.js /app/
RUN cd /app; npm install
ENTRYPOINT ["node", "/app/bot.js", "/app/config.js"]
