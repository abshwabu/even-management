import Event from './Event.js';
import Guest from './Guest.js';
import Opportunity from './Opportunity.js';
import Applicant from './Applicant.js';

// Set up associations
const setupAssociations = () => {
    // Event has many Guests
    Event.hasMany(Guest, { 
        foreignKey: 'eventId',
        as: 'guests',
        onDelete: 'CASCADE'
    });
    
    // Guest belongs to an Event
    Guest.belongsTo(Event, {
        foreignKey: 'eventId',
        as: 'event'
    });

    // Opportunity has many Applicants
    Opportunity.hasMany(Applicant, {
        foreignKey: 'opportunityId',
        as: 'applicants',
        onDelete: 'CASCADE'
    });

    // Applicant belongs to an Opportunity
    Applicant.belongsTo(Opportunity, {
        foreignKey: 'opportunityId',
        as: 'opportunity'
    });
};

export default setupAssociations; 