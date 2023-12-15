# The base image for Dockerizing the Node.js application
FROM node:20-alpine

# set time zone
RUN apk add --no-cache tzdata
ENV TZ="Asia/Taipei"

# Installing the nodemon package for monitoring the Express server
RUN npm install -g nodemon

# Creating the working directory
WORKDIR .

# Copies the dependencies in the package.json file
COPY package.json .

# Installing all the dependencies
RUN npm install

# Copies all the files to the working directory
COPY . .

# Container will run on this port
EXPOSE 8081

# Start the Docker container Node.js application
CMD ["node", "app.js"]