import sequelize from './config/database.js';

async function fixEventsTable() {
  try {
    // First, add the column with NULL allowed temporarily
    await sequelize.query(`ALTER TABLE "Events" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE;`);
    
    // Then update all existing records to have the current timestamp
    await sequelize.query(`UPDATE "Events" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;`);
    
    // Finally, set the column to NOT NULL
    await sequelize.query(`ALTER TABLE "Events" ALTER COLUMN "updatedAt" SET NOT NULL;`);
    
    console.log('Events table updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating Events table:', error);
    process.exit(1);
  }
}

fixEventsTable(); 