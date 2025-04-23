import sequelize from './config/database.js';
import { QueryTypes } from 'sequelize';

async function fixEventsTable() {
  try {
    console.log('Starting database fix...');
    
    // Add city column
    try {
      await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN city VARCHAR(255)");
      console.log('Added city column to Events table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('City column already exists');
      } else {
        console.error('Error adding city column:', error.message);
      }
    }
    
    // Add place column
    try {
      await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN place VARCHAR(255)");
      console.log('Added place column to Events table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Place column already exists');
      } else {
        console.error('Error adding place column:', error.message);
      }
    }
    
    console.log('Database fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Database fix failed:', error);
    process.exit(1);
  }
}

fixEventsTable(); 