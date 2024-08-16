# Back-end WebRTC Express Application

This documentation will walk you through the steps to run Openspace Express application with Postgres and PostGIS.

## Prerequisites
Before getting started, make sure you have the following installed on your system:
- Node.js
- PostgreSQL
- PostGIS extension for PostgreSQL

## Step 1: Clone the repository
Clone the repository containing the Express application to your local machine.

```shell
git clone https://github.com/OpenSpace/UI-WebRTC.git
```

## Step 2: Install dependencies
Navigate to the project directory and install the required dependencies using npm.

```shell
cd Backend-WebRTC
npm install
```

## Step 3: Set up the database
Create a new PostgreSQL database and enable the PostGIS extension.

```shell
createdb openspace
psql -d openspace -c "CREATE EXTENSION postgis;"
```

## Step 4: Configure the database connection
Open the `.env` file in the project directory and update the database connection details.

```shell
DB_HOST=<database-host>
DB_PORT=<database-port>
DB_NAME=<database-name>
DB_USER=<database-username>
DB_PASSWORD=<database-password>
```

## Step 5: Start the application
Start the Express application using the following command:

```shell
npm start
```

## Step 6: Test the application
Open the web browser and navigate to `http://localhost:<port>`, where `<port>` is the port specified in the Express application.

For more help, reach out to our developers Abhay Garg, Sonia Castelo, Gene Payne on [Slack](https://openspacesupport.slack.com/join/shared_invite/zt-24uhn3wvo-gCGHgjg2m9tHzKUEb_FyMQ).


#to-do
user analytics, server analytics