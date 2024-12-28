FROM node:19-alpine

WORKDIR /app

COPY . .
RUN mkdir keys

RUN yarn install

# para ter o module no command
COPY ./my_types/command.d.ts ./node_modules/kozz-types/dist/GatewayToHandler/command.d.ts

EXPOSE 4521

CMD yarn start