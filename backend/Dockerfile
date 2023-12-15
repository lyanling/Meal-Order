FROM node:20-alpine
# The base image for Dockerizing the Node.js application

# RUN apk add --no-cache tzdata

# ENV TZ="Asia/Taipei"

RUN npm install -g nodemon
# Installing the nodemon package for monitoring the Express server

WORKDIR .
# Creating the working directory

COPY package.json .
# Copies the dependencies in the package.json file

RUN npm install
# Installing all the dependencies

COPY . .
# Copies all the files to the working directory

EXPOSE 8081
# Container will run on this port

CMD ["node", "app.js"]
# Start the Docker container Node.js application