import User from './User.js';
import Event from './Event.js';
import Registration from './Registration.js';
import Guest from './Guest.js';
import Payment from './Payment.js';
import Notification from './Notification.js';
import Opportunity from './Opportunity.js';
import Applicant from './Applicant.js';
import News from './News.js';
import Category from './Category.js';
import OpportunityCategory from './OpportunityCategory.js';

// Clear any existing associations to prevent duplicates
// This is important when the file might be loaded multiple times
Event.associations = {};
Guest.associations = {};
User.associations = {};
Registration.associations = {};
Opportunity.associations = {};
Applicant.associations = {};
News.associations = {};
Category.associations = {};
OpportunityCategory.associations = {};

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

// Opportunity associations
Opportunity.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Opportunity.belongsTo(OpportunityCategory, { foreignKey: 'categoryId', as: 'category' });
Opportunity.hasMany(Applicant, { foreignKey: 'opportunityId', as: 'applicants' });

// Applicant belongs to an Opportunity
Applicant.belongsTo(Opportunity, {
    foreignKey: 'opportunityId',
    as: 'opportunity'
});

// An Event belongsTo its organizer
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
User.hasMany(Event, { foreignKey: 'organizerId', as: 'events' });

// News belongs to a Category
News.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// Category has many News
Category.hasMany(News, {
    foreignKey: 'categoryId',
    as: 'news'
});

// OpportunityCategory associations
OpportunityCategory.hasMany(Opportunity, { foreignKey: 'categoryId', as: 'opportunities' });

export default {
  User,
  Event,
  Registration,
  Guest,
  Payment,
  Notification,
  Opportunity,
  Applicant,
  News,
  Category,
  OpportunityCategory
}; 