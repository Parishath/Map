const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRoute = sequelize.define('UserRoute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    route_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_km_traveled: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pricing_per_km: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    total_reimbursement: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    }
}, {
    tableName: 'user_routes',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['tenant_id', 'user_id', 'route_date'] }
    ]
});

const LocationPing = sequelize.define('LocationPing', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_route_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UserRoute,
            key: 'id'
        }
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    accuracy: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    ping_timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'location_pings',
    timestamps: false,
    indexes: [
        { fields: ['user_route_id'] }
    ]
});

const AssignedLocation = sequelize.define('AssignedLocation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    radius_meters: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    }
}, {
    tableName: 'assigned_locations',
    timestamps: true,
    indexes: [
        { fields: ['tenant_id', 'user_id'] }
    ]
});

// Relationships
UserRoute.hasMany(LocationPing, { foreignKey: 'user_route_id', as: 'pings' });
LocationPing.belongsTo(UserRoute, { foreignKey: 'user_route_id' });

module.exports = {
    UserRoute,
    LocationPing,
    AssignedLocation
};
