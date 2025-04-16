import sequelize from './config/database.js';

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Postgres connected via Sequelize...');
        
        // Force recreate tables - WARNING: This will delete all data
        await sequelize.sync({ force: true });
        console.log('Database synchronized');
    } catch (error) {
        console.error('Sequelize connection error:', error);
        process.exit(1);
    }
};

export { connectDB, sequelize };