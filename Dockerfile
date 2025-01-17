FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Command to run the seed script before starting the backend service
CMD ["sh", "-c", "node seed.js && node app.js"]
