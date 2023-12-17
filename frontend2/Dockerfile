FROM node:20-alpine

# set time zone
RUN apk add --no-cache tzdata
ENV TZ="Asia/Taipei"

WORKDIR .

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]