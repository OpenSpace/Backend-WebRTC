const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Instance = sequelize.define('Instance', {
    instance_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    server_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('running', 'stopped'),
        allowNull: false,
        defaultValue: 'running'
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    exit_time: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    idle_time: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'instances'
});

module.exports = Instance;
