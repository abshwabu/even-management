import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
// Don't import Event here to avoid circular dependencies
// import Event from './Event.js';
import path from 'path';

const Guest = sequelize.define('Guest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image');
            if (!rawValue) return null;
            
            // Debug the raw value
            console.log('Guest image raw value:', rawValue);
            
            // If it's already a full URL, return as is
            if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
                return rawValue;
            }
            
            // Remove /api/ prefix if it exists
            let cleanPath = rawValue;
            if (cleanPath.startsWith('/api/')) {
                cleanPath = cleanPath.substring(4); // Remove '/api'
            }
            
            // Ensure path starts with /uploads/ if needed
            if (!cleanPath.startsWith('/uploads/')) {
                cleanPath = `/uploads/guests/${path.basename(cleanPath)}`;
            }
            
            return cleanPath;
        }
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events',
            key: 'id'
        }
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
    tableName: 'Guests',
    timestamps: true
});

// Don't define associations here - they should be in associations.js
// Guest.belongsTo(Event, { foreignKey: 'eventId' });
// Event.hasMany(Guest, { foreignKey: 'eventId' });

export default Guest; 