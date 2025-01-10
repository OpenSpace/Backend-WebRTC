require('dotenv').config(); // Load environment variables
const { sequelize } = require('./config/database'); // Import sequelize instance
const Server = require('./models/Server'); // Import Server model
const Instance = require('./models/Instance');
const User = require('./models/userModel');

async function seedDatabase() {
    try {
        // Synchronize the database schema (optional, can be skipped if schema is already up-to-date)
        // await sequelize.sync({ force: false });
        await sequelize.sync({})
        .then(() => {
            console.log("Database & tables created!");
        })
        .catch(err => {
            console.error('Unable to sync database:', err);
        });

        console.log('Database synchronized.');

        // Define the sample server data
        const serverData = {
            region: 'us-east-3',
            ip_address: 'http://192.168.219.221',
            port: 4690,
            available_instances: 5,
            num_instances: 5,
            ram: '64GB',
            graphics_card: 'NVIDIA Tesla T4',
            storage: '1TB SSD',
        };

        // Use findOrCreate to prevent duplicates
        const [server, created] = await Server.findOrCreate({
            where: { ip_address: serverData.ip_address, port: serverData.port },
            defaults: serverData, // Set the data if no existing record is found
        });

        if (created) {
            console.log('Sample server created:', server.toJSON());
        } else {
            console.log('Server already exists:', server.toJSON());
        }
    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        // Close the database connection
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Execute the seed function
seedDatabase();
