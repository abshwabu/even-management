import Event from '../models/Event.js';
import Calendar from '../models/Calendar.js';
import Notification from '../models/Notification.js';
import Guest from '../models/Guest.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// Get all events with pagination and stats
export const getAllEvents = async (req, res) => {
    try {
        const { status, category, isActive, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        const filters = {};
        
        if (status) filters.status = status;
        if (category) filters.category = category;
        if (isActive !== undefined) filters.isActive = isActive === 'true';
        
        // Check if city and place columns exist
        let cityExists = true;
        let placeExists = true;
        
        try {
            await sequelize.query(
                "SELECT city FROM \"Events\" LIMIT 0",
                { type: QueryTypes.SELECT }
            );
        } catch (error) {
            if (error.message.includes('column "city" does not exist')) {
                cityExists = false;
                console.log('City column does not exist, adding it...');
                await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN IF NOT EXISTS city VARCHAR(255)");
            }
        }
        
        try {
            await sequelize.query(
                "SELECT place FROM \"Events\" LIMIT 0",
                { type: QueryTypes.SELECT }
            );
        } catch (error) {
            if (error.message.includes('column "place" does not exist')) {
                placeExists = false;
                console.log('Place column does not exist, adding it...');
                await sequelize.query("ALTER TABLE \"Events\" ADD COLUMN IF NOT EXISTS place VARCHAR(255)");
            }
        }
        
        // Now proceed with the query
        const { count, rows: events } = await Event.findAndCountAll({
            where: filters,
            order: [['startDateTime', 'ASC']],
            limit,
            offset,
            include: [
                {
                    model: Guest,
                    as: 'guests'
                }
            ]
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        // If includeStats is true, include event statistics
        let stats = null;
        if (includeStats === 'true') {
            const now = new Date();
            
            // Get event statistics
            const totalEvents = await Event.count();
            const totalPastEvents = await Event.count({
                where: {
                    endDateTime: {
                        [Op.lt]: now
                    }
                }
            });
            const totalOngoingEvents = await Event.count({
                where: {
                    startDateTime: {
                        [Op.lte]: now
                    },
                    endDateTime: {
                        [Op.gte]: now
                    }
                }
            });
            const totalUpcomingEvents = await Event.count({
                where: {
                    startDateTime: {
                        [Op.gt]: now
                    }
                }
            });
            const inactiveEvents = await Event.count({
                where: {
                    isActive: false
                }
            });
            
            // Get recent actions
            const recentActions = await Event.findAll({
                attributes: ['id', 'title', 'updatedAt'],
                order: [['updatedAt', 'DESC']],
                limit: 5
            });
            
            stats = {
                totalEvents,
                totalPastEvents,
                totalOngoingEvents,
                totalUpcomingEvents,
                inactiveEvents,
                recentActions: recentActions.map(event => ({
                    actionType: 'update',
                    eventTitle: event.title,
                    dateAndTime: event.updatedAt
                }))
            };
        }
        
        const response = {
            events: events.map(formatEvent),
            pagination: {
                total: count,
                totalPages,
                currentPage,
                perPage: limit,
                hasMore: currentPage < totalPages
            }
        };
        
        // Add stats if requested
        if (stats) {
            response.stats = stats;
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            message: 'Error fetching events',
            error: error.message
        });
    }
};

// Get event by ID
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(formatEvent(event));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create event
export const createEvent = async (req, res) => {
    try {
        // pull out any string-based image fields
        const { 
            mainImage: mainImageFromBody, 
            images: imagesFromBody,
            ...restBody 
        } = req.body;

        // build payload
        const eventData = {
            ...restBody,
            organizerId: req.user.id
        };

        // handle main image
        if (req.files?.mainImage) {
            eventData.mainImage = `/uploads/events/${req.files.mainImage[0].filename}`;
        } else if (typeof mainImageFromBody === 'string' && mainImageFromBody.trim()) {
            eventData.mainImage = mainImageFromBody.trim();
        }

        // handle additional images
        if (req.files?.images) {
            const imagePaths = req.files.images.map(file => `/uploads/events/${file.filename}`);
            eventData.images = imagePaths;
        } else if (imagesFromBody) {
            try {
                const parsedImages = typeof imagesFromBody === 'string' 
                    ? JSON.parse(imagesFromBody) 
                    : imagesFromBody;
                eventData.images = Array.isArray(parsedImages) ? parsedImages : [];
            } catch {
                eventData.images = [];
            }
        }

        const event = await Event.create(eventData);

        // Create calendar entry
        await Calendar.create({
            eventId: event.id,
            startDate: event.startDateTime,
            endDate: event.endDateTime,
            startTime: new Date(event.startDateTime).toLocaleTimeString('en-US', { hour12: false }),
            endTime: new Date(event.endDateTime).toLocaleTimeString('en-US', { hour12: false }),
            isRecurring: event.isRecurring,
            recurrencePattern: event.recurrencePattern
        });

        // Create notification
        await Notification.create({
            userId: event.organizerId,
            message: `There is a new event: ${event.title}`,
            isRead: false
        });

        return res.status(201).json(formatEvent(event));
    } catch (error) {
        console.error('Error creating event:', error);
        if (
            error instanceof ValidationError ||
            error instanceof UniqueConstraintError ||
            error.name === 'SequelizeValidationError'
        ) {
            const messages = (error.errors || []).map(e => e.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages.length ? messages : [error.message]
            });
        }
        return res.status(400).json({
            message: 'Error creating event',
            error: error.message
        });
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this event' });
        }

        // pull out image fields and block organizerId
        const {
            organizerId: _ignore,
            mainImage: mainImageFromBody,
            images: imagesFromBody,
            ...restFields
        } = req.body;

        const updateData = { ...restFields };

        // handle main image
        if (req.files?.mainImage) {
            updateData.mainImage = `/uploads/events/${req.files.mainImage[0].filename}`;
        } else if (typeof mainImageFromBody === 'string' && mainImageFromBody.trim()) {
            updateData.mainImage = mainImageFromBody.trim();
        }

        // handle additional images
        if (req.files?.images) {
            const imagePaths = req.files.images.map(file => `/uploads/events/${file.filename}`);
            updateData.images = imagePaths;
        } else if (imagesFromBody) {
            try {
                const parsedImages = typeof imagesFromBody === 'string' 
                    ? JSON.parse(imagesFromBody) 
                    : imagesFromBody;
                updateData.images = Array.isArray(parsedImages) ? parsedImages : [];
            } catch {
                // keep existing images if parsing fails
                delete updateData.images;
            }
        }

        await event.update(updateData);
        return res.json(event);
    } catch (error) {
        console.error('Error updating event:', error);
        if (
            error instanceof ValidationError ||
            error instanceof UniqueConstraintError ||
            error.name === 'SequelizeValidationError'
        ) {
            const messages = (error.errors || []).map(e => e.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages.length ? messages : [error.message]
            });
        }
        return res.status(400).json({
            message: 'Error updating event',
            error: error.message
        });
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        // Start a transaction to ensure all operations succeed or fail together
        const transaction = await sequelize.transaction();

        try {
            const event = await Event.findByPk(req.params.id);
            if (!event) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Event not found' });
            }

            if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
                await transaction.rollback();
                return res.status(403).json({ message: 'Not authorized to delete this event' });
            }

            // First, delete related calendar entries
            await Calendar.destroy({
                where: { eventId: req.params.id },
                transaction
            });

            // Then, delete related guests
            await Guest.destroy({
                where: { eventId: req.params.id },
                transaction
            });

            // Then, delete related registrations
            await Registration.destroy({
                where: { eventId: req.params.id },
                transaction
            });

            // Finally, delete the event
            await event.destroy({ transaction });

            // Commit the transaction
            await transaction.commit();
            
            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            // Rollback the transaction if any operation fails
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
};

// ─── 1) HELPER ────────────────────────────────────────────────────────────────
/**
 * Convert an Event instance into JSON:
 *  - strip out the raw JSON column
 *  - re-inject city/place
 *  - return `location` as "lat,lng" string
 */
function formatEvent(event) {
  // 1) grab raw JSON column (may be string or object)
  let rawLoc = event.getDataValue('location');
  if (typeof rawLoc === 'string') {
    try { rawLoc = JSON.parse(rawLoc); }
    catch { rawLoc = { position:{lat:null,lng:null} }; }
  }

  // 2) extract lat/lng
  const pos = rawLoc.position || {};
  const location = [ pos.lat ?? null, pos.lng ?? null ];

  // 3) build final object
  const obj = event.get({ plain: true });
  delete obj.location;
  delete obj.lat;
  delete obj.lng;

  return {
    ...obj,
    location
  };
} 