FROM node:19-alpine

WORKDIR /app

COPY . .

RUN yarn install

#essa porta é importante para usar dentro da network do compose
EXPOSE 4521

CMD yarn start