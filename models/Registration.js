import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Registration = sequelize.define('Registration', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Ensure this matches your Users table name
            key: 'id'
        },
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events', // Ensure this matches your Events table name
            key: 'id'
        },
    },
    registrationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'canceled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'),
        allowNull: true, // Conditionally required; add a custom validator or hook if needed
    },
}, {
    tableName: 'Registrations',
    timestamps: false, // Disable Sequelize auto-generated timestamp fields if not needed
});

export default Registration;
