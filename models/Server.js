const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Server = sequelize.define('Server', {
  server_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  available_instances: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  num_instances: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  ram: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  graphics_card: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  storage: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  // Enable Sequelize's built-in timestamps
  timestamps: true,
  createdAt: 'created', // Map to 'created' field
  updatedAt: 'modified', // Map to 'modified' field
  tableName: 'servers',
});

module.exports = Server;
