const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');

const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const serverRoutes = require('./routes/serverRoutes');
const instanceRoutes = require('./routes/instanceRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use('/health', healthRoutes);
app.use('/users', userRoutes);
app.use('/servers', serverRoutes);
app.use('/instances', instanceRoutes);

// Test database connection and sync models
sequelize.sync().then(() => {
    console.log('Database connected and models synced');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

module.exports = app;
