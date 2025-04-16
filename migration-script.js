import sequelize from './config/database.js';

async function updateEventsTable() {
  try {
    await sequelize.query(`ALTER TABLE "Events" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;`);
    console.log('Events table updated successfully');
  } catch (error) {
    console.error('Error updating Events table:', error);
  }
}

updateEventsTable(); 