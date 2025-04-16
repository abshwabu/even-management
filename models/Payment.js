import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
    registrationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Registrations', // Ensure this matches your Registrations table/model name
            key: 'id'
        },
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    paymentMethod: {
        type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'),
        allowNull: false,
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    updatedAt: false, // Disable updatedAt if not required
    tableName: 'Payments',
});

export default Payment;
