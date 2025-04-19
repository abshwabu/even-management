import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function addEmailToGuests() {
    try {
        // Check if the column exists
        const columns = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'Guests' AND column_name = 'email'",
            { type: QueryTypes.SELECT }
        );
        
        // If the column doesn't exist, add it
        if (columns.length === 0) {
            await sequelize.query(
                "ALTER TABLE \"Guests\" ADD COLUMN email VARCHAR(255)"
            );
            console.log('Added email column to Guests table');
        } else {
            console.log('Email column already exists in Guests table');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

addEmailToGuests(); 