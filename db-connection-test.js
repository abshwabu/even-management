import sequelize from './config/database.js';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Get database version
    const [result] = await sequelize.query('SELECT version()');
    console.log('Database version:', result[0].version);
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection(); 