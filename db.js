import sequelize from './config/database.js';
import associations from './models/associations.js';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to PostgreSQL...');
        await sequelize.authenticate();
        console.log('PostgreSQL connected via Sequelize...');
        
        // In production, you might not want to force sync tables
        // as it will delete all existing data
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized (tables altered)');
        } else {
            // In production, just sync without altering
            await sequelize.sync();
            console.log('Database synchronized (existing tables preserved)');
        }
    } catch (error) {
        console.error('Sequelize connection error:', error);
        
        // Don't exit the process in production, let the server run even if DB is down
        if (process.env.NODE_ENV === 'development') {
            process.exit(1);
        }
    }
};

export { connectDB, sequelize, associations };