import sequelize from './config/database.js';
import { QueryTypes } from 'sequelize';
import Event from './models/Event.js';
import Calendar from './models/Calendar.js';
import Guest from './models/Guest.js';
import Registration from './models/Registration.js';

async function diagnoseIssues() {
  try {
    console.log('Starting diagnostic tests...');
    
    // Test 1: Database connection
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    
    // Test 2: Check Events table structure
    try {
      const eventsColumns = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Events'",
        { type: QueryTypes.SELECT }
      );
      console.log('✅ Events table structure retrieved');
      console.log('Columns:', eventsColumns.map(col => col.column_name).join(', '));
      
      // Check for city and place columns
      const hasCity = eventsColumns.some(col => col.column_name === 'city');
      const hasPlace = eventsColumns.some(col => col.column_name === 'place');
      
      if (!hasCity || !hasPlace) {
        console.log('❌ Missing columns in Events table:');
        if (!hasCity) console.log('  - city column is missing');
        if (!hasPlace) console.log('  - place column is missing');
        
        // Try to add missing columns
        console.log('Attempting to add missing columns...');
        if (!hasCity) {
          await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN city VARCHAR(255)");
          console.log('✅ Added city column');
        }
        if (!hasPlace) {
          await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN place VARCHAR(255)");
          console.log('✅ Added place column');
        }
      } else {
        console.log('✅ city and place columns exist in Events table');
      }
    } catch (error) {
      console.error('❌ Error checking Events table structure:', error.message);
    }
    
    // Test 3: Check foreign key constraints
    try {
      const foreignKeys = await sequelize.query(
        `SELECT
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND (tc.table_name='Events' OR ccu.table_name='Events')`,
        { type: QueryTypes.SELECT }
      );
      
      console.log('✅ Foreign key constraints retrieved');
      console.log('Foreign keys:', JSON.stringify(foreignKeys, null, 2));
    } catch (error) {
      console.error('❌ Error checking foreign key constraints:', error.message);
    }
    
    // Test 4: Try to create and delete a test event
    try {
      console.log('Testing event creation and deletion...');
      
      // Create a test event
      const testEvent = await Event.create({
        title: 'Test Event',
        description: 'This is a test event for diagnostics',
        startDateTime: new Date(),
        endDateTime: new Date(Date.now() + 3600000),
        organizerId: 1, // Assuming user ID 1 exists
        city: 'Test City',
        place: 'Test Place'
      });
      
      console.log(`✅ Test event created with ID: ${testEvent.id}`);
      
      // Try to delete the test event with transaction
      const transaction = await sequelize.transaction();
      
      try {
        // Delete related records first
        await Calendar.destroy({
          where: { eventId: testEvent.id },
          transaction
        });
        
        await Guest.destroy({
          where: { eventId: testEvent.id },
          transaction
        });
        
        await Registration.destroy({
          where: { eventId: testEvent.id },
          transaction
        });
        
        // Delete the event
        await testEvent.destroy({ transaction });
        
        await transaction.commit();
        console.log('✅ Test event deleted successfully');
      } catch (error) {
        await transaction.rollback();
        console.error('❌ Error deleting test event:', error.message);
        
        // Try to identify the specific constraint issue
        if (error.message.includes('foreign key constraint')) {
          console.log('Analyzing constraint violation...');
          
          // Check which tables have references to this event
          const tables = ['Calendars', 'Guests', 'Registrations'];
          
          for (const table of tables) {
            try {
              const count = await sequelize.query(
                `SELECT COUNT(*) FROM "${table}" WHERE "eventId" = ${testEvent.id}`,
                { type: QueryTypes.SELECT }
              );
              console.log(`${table} references: ${count[0].count}`);
            } catch (e) {
              console.error(`Error checking ${table}:`, e.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in event creation test:', error.message);
    }
    
    console.log('Diagnostic tests completed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during diagnostics:', error);
    process.exit(1);
  }
}

diagnoseIssues(); 