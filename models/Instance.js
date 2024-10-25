const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Server = require('./Server'); // Import Server model for associations

const Instance = sequelize.define('Instance', {
  instance_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  server_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Server,
      key: 'server_id',
    },
  },
  status: {
    type: DataTypes.ENUM('IDLE', 'INITIALIZING', 'RUNNING', 'DEINITIALIZING', 'TERMINATED'),
    allowNull: false,
    defaultValue: 'IDLE',
  },
}, {
  // Enable Sequelize's built-in timestamps
  timestamps: true,
  createdAt: 'created', // Map to 'created' field
  updatedAt: 'modified', // Map to 'modified' field
  tableName: 'instances',
});

// Set up the association between Instance and Server models
Instance.belongsTo(Server, { foreignKey: 'server_id' });
Server.hasMany(Instance, { foreignKey: 'server_id' });

module.exports = Instance;
