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
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    exit_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    idle_time: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'instances'
});

module.exports = Instance;
