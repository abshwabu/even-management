import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    startDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },

    endDateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },

    // Store full location JSON here
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        city: '',
        place: '',
        position: { lat: null, lng: null }
      }
    },

    // Expose lat/lng at top level
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
      allowNull: true
    },

    place: {
      type: DataTypes.STRING,
      allowNull: true
    },

    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    mainImage: {
      type: DataTypes.STRING,
      allowNull: true
    },

    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },

    isRecurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    recurrencePattern: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'none'),
      allowNull: false,
      defaultValue: 'none'
    },

    category: {
      type: DataTypes.STRING,
      allowNull: true
    },

    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'canceled'),
      allowNull: false,
      defaultValue: 'upcoming'
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'Events',
    timestamps: true
  }
);

export default Event; 