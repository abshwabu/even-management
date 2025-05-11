import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import path from 'path';

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
            
            // Debug the raw value
            console.log('Opportunity image raw value:', rawValue);
            
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
                cleanPath = `/uploads/opportunities/${path.basename(cleanPath)}`;
            }
            
            return cleanPath;
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