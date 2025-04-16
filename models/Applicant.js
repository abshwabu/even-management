import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Applicant = sequelize.define('Applicant', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resume: {
        type: DataTypes.STRING, // Path to uploaded resume file
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'hired'),
        allowNull: false,
        defaultValue: 'pending',
    },
    opportunityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Opportunities',
            key: 'id'
        },
        onDelete: 'CASCADE' // Delete applications when opportunity is deleted
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for non-registered applicants
        references: {
            model: 'Users',
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
    tableName: 'Applicants',
});

export default Applicant; 