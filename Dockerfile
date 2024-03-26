FROM node:19-alpine

WORKDIR /app

COPY . .

RUN yarn install

# para ter o module no command
COPY ./node_modules/kozz-types/dist/GatewayToHandler/command.d.ts ./node_modules/kozz-types/dist/GatewayToHandler/command.d.ts

#essa porta é importante para usar dentro da network do compose
EXPOSE 4521

CMD yarn start