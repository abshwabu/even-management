import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

async function addCityPlaceToEvents() {
    try {
        // Check if the city column exists
        const cityColumn = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'city'",
            { type: QueryTypes.SELECT }
        );
        
        // If the city column doesn't exist, add it
        if (cityColumn.length === 0) {
            await sequelize.query(
                "ALTER TABLE \"Events\" ADD COLUMN city VARCHAR(255)"
            );
            console.log('Added city column to Events table');
        } else {
            console.log('City column already exists in Events table');
        }
        
        // Check if the place column exists
        const placeColumn = await sequelize.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'Events' AND column_name = 'place'",
            { type: QueryTypes.SELECT }
        );
        
        // If the place column doesn't exist, add it
        if (placeColumn.length === 0) {
            await sequelize.query(
                "ALTER TABLE \"Events\" ADD COLUMN place VARCHAR(255)"
            );
            console.log('Added place column to Events table');
        } else {
            console.log('Place column already exists in Events table');
        }
        
        console.log('Event model updated with city and place fields');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

addCityPlaceToEvents(); 