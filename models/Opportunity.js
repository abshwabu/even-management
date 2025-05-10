import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Opportunity = sequelize.define('Opportunity', {
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
    requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image');
            if (!rawValue) return null;
            // If it's already a full URL, return as is
            if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
                return rawValue;
            }
            // Otherwise, ensure it starts with a forward slash
            return rawValue.startsWith('/') ? rawValue : `/${rawValue}`;
        }
    },
    status: {
        type: DataTypes.ENUM('open', 'closed', 'draft'),
        allowNull: false,
        defaultValue: 'draft',
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'OpportunityCategories',
            key: 'id'
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isRemote: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
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
    tableName: 'Opportunities',
    timestamps: true
});

export default Opportunity; 