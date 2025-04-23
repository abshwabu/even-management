import sequelize from './config/database.js';
import './models/associations.js';

async function syncModels() {
  try {
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('Models synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing models:', error);
    process.exit(1);
  }
}

syncModels(); 