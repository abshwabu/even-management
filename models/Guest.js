import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
// Don't import Event here to avoid circular dependencies
// import Event from './Event.js';

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
    // If email doesn't exist in the database, use these fields instead
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    eventId: {
        type: DataTypes.INTEGER,
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