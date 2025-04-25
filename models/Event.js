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
        },
        get() {
            const raw = this.getDataValue('location');
            if (raw) {
                if (typeof raw === 'string') {
                    try { return JSON.parse(raw); }
                    catch { /* fall through */ }
                }
                return raw;
            }
            return { city:'', place:'', position:{lat:null,lng:null} };
        }
    },
    lat: {
        type: DataTypes.VIRTUAL,
        get() {
            const loc = this.getDataValue('location');
            return loc?.position?.lat ?? null;
        }
    },
    lng: {
        type: DataTypes.VIRTUAL,
        get() {
            const loc = this.getDataValue('location');
            return loc?.position?.lng ?? null;
        }
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    place: {
        type: DataTypes.STRING,
        allowNull: true,
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
        get() {
            // Ensure images is returned as an array
            const rawValue = this.getDataValue('images');
            if (rawValue) {
                if (typeof rawValue === 'string') {
                    try {
                        return JSON.parse(rawValue);
                    } catch (e) {
                        console.error('Error parsing images JSON:', e);
                        return [];
                    }
                }
                return rawValue;
            }
            return [];
        },
        set(value) {
            // Ensure images is stored as a JSON string
            if (value) {
                if (typeof value === 'string') {
                    try {
                        JSON.parse(value);
                        this.setDataValue('images', value);
                    } catch (e) {
                        console.error('Invalid JSON string for images:', e);
                        this.setDataValue('images', '[]');
                    }
                } else {
                    this.setDataValue('images', JSON.stringify(value));
                }
            } else {
                this.setDataValue('images', '[]');
            }
        }
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
