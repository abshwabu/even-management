import sequelize from './config/database.js';

async function fixDatabase() {
  try {
    console.log('Starting database fixes...');
    
    // Add city and place columns to Events table
    try {
      await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN IF NOT EXISTS city VARCHAR(255)");
      console.log('✅ Added city column to Events table');
    } catch (error) {
      console.error('❌ Error adding city column:', error.message);
    }
    
    try {
      await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN IF NOT EXISTS place VARCHAR(255)");
      console.log('✅ Added place column to Events table');
    } catch (error) {
      console.error('❌ Error adding place column:', error.message);
    }
    
    console.log('Database fixes completed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during database fixes:', error);
    process.exit(1);
  }
}

fixDatabase(); 