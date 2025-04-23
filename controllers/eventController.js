import Event from '../models/Event.js';
import Calendar from '../models/Calendar.js';
import Notification from '../models/Notification.js';
import Guest from '../models/Guest.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

// Get all events with pagination and stats
export const getAllEvents = async (req, res) => {
    try {
        const { status, category, isActive, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        const filters = {};
        
        if (status) filters.status = status;
        if (category) filters.category = category;
        if (isActive !== undefined) filters.isActive = isActive === 'true';
        
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
            events,
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
            return res.status(404).send({ error: 'Event not found' });
        }
        res.status(200).send(event);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Create event
export const createEvent = async (req, res) => {
    try {
        // Process uploaded files
        const mainImage = req.files.mainImage ? `/uploads/events/${req.files.mainImage[0].filename}` : null;
        
        // Process additional images if any
        const additionalImages = [];
        if (req.files.images) {
            req.files.images.forEach(file => {
                additionalImages.push(`/uploads/events/${file.filename}`);
            });
        }
        
        // Remove any fields that don't exist in the model
        const { invitedGuests, ...eventData } = req.body;
        
        const event = await Event.create({
            ...eventData,
            organizerId: req.user.id,
            mainImage: mainImage,
            images: additionalImages
        });

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

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error creating event', error: error.message });
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

        // Remove fields that don't exist in the model
        const { organizerId, invitedGuests, ...updateData } = req.body;
        
        // Process main image if uploaded
        if (req.files && req.files.mainImage) {
            updateData.mainImage = `/uploads/events/${req.files.mainImage[0].filename}`;
        }
        
        // Process additional images if uploaded
        if (req.files && req.files.images) {
            // If append=true in query, add to existing images
            if (req.query.append === 'true') {
                const newImages = req.files.images.map(file => `/uploads/events/${file.filename}`);
                updateData.images = [...(event.images || []), ...newImages];
            } else {
                // Replace all images
                updateData.images = req.files.images.map(file => `/uploads/events/${file.filename}`);
            }
        }
        
        await event.update(updateData);
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error updating event', error: error.message });
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