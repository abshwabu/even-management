import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Check if PG_URI is defined
const pgUri = process.env.PG_URI;
if (!pgUri) {
    console.error('PG_URI is not defined in environment variables');
    process.exit(1);
}

const sequelize = new Sequelize(pgUri, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

export default sequelize;