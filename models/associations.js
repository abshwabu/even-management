import User from './User.js';
import Event from './Event.js';
import Registration from './Registration.js';
import Guest from './Guest.js';
import Payment from './Payment.js';
import Notification from './Notification.js';
import Opportunity from './Opportunity.js';
import Applicant from './Applicant.js';

// Clear any existing associations to prevent duplicates
// This is important when the file might be loaded multiple times
Event.associations = {};
Guest.associations = {};
User.associations = {};
Registration.associations = {};
Opportunity.associations = {};
Applicant.associations = {};

// Define associations
User.hasMany(Registration, { foreignKey: 'userId' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Event.hasMany(Registration, { foreignKey: 'eventId' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Define the Event-Guest association
Event.hasMany(Guest, { 
    foreignKey: 'eventId',
    as: 'guests'
});

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

// Add other associations as needed

export default {
  User,
  Event,
  Registration,
  Guest,
  Payment,
  Notification,
  Opportunity,
  Applicant
  // Add other models
}; 