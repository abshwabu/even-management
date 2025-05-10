import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Check for DATABASE_URL (Render's default) or PG_URI
const dbUrl = process.env.DATABASE_URL || process.env.PG_URI;
if (!dbUrl) {
  console.error('DATABASE_URL or PG_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Connecting to database with dialect: postgres');

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? 'production' : 'development'}`);

// Configure SSL based on environment
const sslConfig = isProduction ? {
  require: true,
  rejectUnauthorized: false
} : false;

console.log(`SSL config: ${sslConfig ? 'enabled' : 'disabled'}`);

// Create Sequelize instance with environment-specific settings
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: (msg) => console.log(`[Sequelize] ${msg}`),
  dialectOptions: {
    ssl: sslConfig
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection immediately
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    
    // Sync all models with the database
    // In production, we use alter: true to be safe
    // In development, we can use force: true to recreate tables
    return sequelize.sync({ 
      alter: isProduction,
      force: !isProduction 
    });
  })
  .then(() => {
    console.log('Database schema synchronized successfully');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;