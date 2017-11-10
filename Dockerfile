FROM node:alpine

LABEL maintainer="Jiayu Liu <jiayu@caicloud.io>"

WORKDIR "/opt/app/"

ADD package.json yarn.lock /opt/app/

RUN yarn

ADD . /opt/app

ENV PORT=3000 \
  IMAGE_ROOT="/opt/images"

EXPOSE 3000

CMD ["node", "server.js"]
