const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');
const { startStatusUpdater, stopStatusUpdater } = require('./scripts/statusUpdater');


const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const serverRoutes = require('./routes/serverRoutes');
const instanceRoutes = require('./routes/instanceRoutes');

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(bodyParser.json());

app.use(cors());
app.use('/health', healthRoutes);
app.use('/users', userRoutes);
app.use('/servers', serverRoutes);
app.use('/instances', instanceRoutes);

// Sync the models with the database
sequelize.sync({})
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });

startStatusUpdater();

const server = app.listen(port, () => {
  console.log('Server running on port', port);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  stopStatusUpdater();
  server.close(() => {
      console.log('App closed.');
      process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  stopStatusUpdater();
  server.close(() => {
      console.log('Server closed.');
      process.exit(0);
  });
});

module.exports = app;
