import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function syncGuestModel() {
    try {
        // Check if the membership column exists
        const membershipColumn = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'Guests' AND column_name = 'membership'",
            { type: QueryTypes.SELECT }
        );
        
        // If the column exists, drop it
        if (membershipColumn.length > 0) {
            await sequelize.query(
                "ALTER TABLE \"Guests\" DROP COLUMN membership"
            );
            console.log('Dropped membership column from Guests table');
        } else {
            console.log('Membership column does not exist in Guests table');
        }
        
        // Check if the email column exists
        const emailColumn = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'Guests' AND column_name = 'email'",
            { type: QueryTypes.SELECT }
        );
        
        // If the column exists, drop it
        if (emailColumn.length > 0) {
            await sequelize.query(
                "ALTER TABLE \"Guests\" DROP COLUMN email"
            );
            console.log('Dropped email column from Guests table');
        } else {
            console.log('Email column does not exist in Guests table');
        }
        
        console.log('Guest model synchronized with database');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

syncGuestModel(); 