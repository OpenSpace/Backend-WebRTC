# Back-end WebRTC Express Application

This documentation will walk you through the steps to run Openspace Express application with Postgres and PostGIS.

## Prerequisites
Before getting started, make sure you have the following installed on your system:
- Node.js (https://nodejs.org/en/download)
- PostgreSQL (https://www.postgresql.org/download/)
- DBeaver (https://dbeaver.io/download/)

## Step 1: Clone the repository
Clone the repository:

```bash
git clone https://github.com/OpenSpace/Backend-WebRTC.git
```

## Step 2: Install dependencies
Navigate to the project directory and install the required dependencies using npm.

```shell
cd Backend-WebRTC
npm install
```

## Step 3: Set up the database
Create a new PostgreSQL database
Follow this medium article to setup postgres and dbeaver in windows:
https://medium.com/@zum.hatice/how-to-create-a-postgresql-db-and-connect-in-windows-b26eaa48c7fb

Make sure you have performed below command while setting up postgres and dbeaver.
```bash
createdb openspace
```

## Step 4: Configure the database connection
Open the `.env` file in the project directory and update the database connection details as required.

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME='openspace'
DB_USER='postgres'
DB_PASSWORD='password'
```

## Step 5: Seed the tables and configs
```bash
node seed.js
```

## Step 6: Start the application
Start the Express application using the following command:

```bash
npm start
```

## Step 6: Test the application
Open the postman (or any API management tool) and access APIs at `http://localhost:5000`, where `5000` is the default port specified in the backend express application.

For more help, reach out to our developers Abhay Garg, Sonia Castelo, Gene Payne on [Slack](https://openspacesupport.slack.com/join/shared_invite/zt-24uhn3wvo-gCGHgjg2m9tHzKUEb_FyMQ).


# To-Do
user analytics, server analytics