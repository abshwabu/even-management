import sequelize from './config/database.js';
import associations from './models/associations.js';

const connectDB = async () => {
    try {
        console.log('Attempting to connect to PostgreSQL...');
        await sequelize.authenticate();
        console.log('PostgreSQL connected via Sequelize...');
        
        try {
            // Use a safer approach with force: false and alter: false by default
            if (process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true') {
                await sequelize.sync({ alter: true });
                console.log('Database synchronized (tables altered)');
            } else {
                // In production, just check connection without syncing
                console.log('Database connected. Skipping sync to preserve data.');
            }
        } catch (syncError) {
            console.error('Error during database sync. Continuing without sync:', syncError.message);
            // Don't throw error, allow server to start
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