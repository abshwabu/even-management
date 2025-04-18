import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    startDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            city: '',
            place: '',
            position: {
                lat: null,
                lng: null
            }
        }
    },
    organizerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
    },
    mainImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON, // Store array of image paths
        allowNull: true,
        defaultValue: [],
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    isRecurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    recurrencePattern: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'none'),
        allowNull: false,
        defaultValue: 'none',
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'canceled'),
        allowNull: false,
        defaultValue: 'upcoming',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Events',
    timestamps: true
});

// Note: We'll define associations in associations.js, not here
// This prevents circular dependency issues

export default Event;
