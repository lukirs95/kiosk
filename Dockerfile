FROM node:current-alpine

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY . .

RUN npm install

EXPOSE 9000
VOLUME [ "/home/node/app/resources" ]

CMD [ "npm", "run", "prod" ]