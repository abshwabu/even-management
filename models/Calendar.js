import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Calendar = sequelize.define('Calendar', {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events', // Ensure this matches your Events table name
            key: 'id',
        },
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
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
}, {
    tableName: 'Calendars',
    timestamps: false, // Disable createdAt and updatedAt if not needed
});

export default Calendar;
