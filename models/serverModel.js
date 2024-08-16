const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Server = sequelize.define('Server', {
    server_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('running', 'stopped'),
        allowNull: false,
        defaultValue: 'running'
    },
    num_instances: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available_instances: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ram: {
        type: DataTypes.STRING,
        allowNull: false
    },
    graphics_card: {
        type: DataTypes.STRING,
        allowNull: false
    },
    storage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    geo_location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'servers'
});

module.exports = Server;
