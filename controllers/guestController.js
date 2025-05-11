import Guest from '../models/Guest.js';
import Event from '../models/Event.js';
import upload from '../middleware/upload.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// Get all guests
export const getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.findAll({
            attributes: ['id', 'name', 'profession', 'description', 'image', 'eventId', 'createdAt', 'updatedAt'],
            include: [{ model: Event, as: 'event' }]
        });
        res.status(200).json(guests);
    } catch (error) {
        console.error('Error getting guests:', error);
        res.status(500).json({ 
            message: 'Error fetching guests', 
            error: error.message 
        });
    }
};

// Get guests by event ID
export const getGuestsByEventId = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const guests = await Guest.findAll({
            attributes: ['id', 'name', 'profession', 'description', 'image', 'eventId', 'createdAt', 'updatedAt'],
            where: { eventId },
            include: [{ model: Event, as: 'event' }]
        });
        
        res.status(200).json(guests);
    } catch (error) {
        console.error('Error getting guests by event:', error);
        res.status(500).json({ 
            message: 'Error fetching guests for event', 
            error: error.message 
        });
    }
};

// Create a new guest
export const createGuest = async (req, res) => {
    try {
        console.log('Creating guest with request:', {
            body: req.body,
            file: req.file,
            params: req.params,
            originalUrl: req.originalUrl
        });
        
        const { eventId } = req.params;
        // pull out any image string
        const { image: imageFromBody, name, profession, description } = req.body;

        // Check event
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // build payload
        const guestData = { name, profession, description, eventId };
        if (req.file) {
            guestData.image = `/uploads/guests/${req.file.filename}`;
            console.log('Using uploaded file for image:', guestData.image);
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            guestData.image = imageFromBody.trim();
            console.log('Using image from body:', guestData.image);
        } else {
            console.log('No image provided');
        }

        const guest = await Guest.create(guestData);
        console.log('Guest created successfully:', guest.toJSON());
        return res.status(201).json(guest);
    } catch (error) {
        console.error('Error creating guest:', error);
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
            message: 'Error creating guest',
            error: error.message
        });
    }
};

// Update a guest
export const updateGuest = async (req, res) => {
    try {
        console.log('Updating guest with request:', {
            body: req.body,
            file: req.file,
            params: req.params,
            originalUrl: req.originalUrl
        });
        
        const { id } = req.params;
        // pull out image, drop membership
        const {
            membership: _ignore,
            image: imageFromBody,
            ...restFields
        } = req.body;

        const guest = await Guest.findByPk(id, {
            include: [{ model: Event, as: 'event', attributes: ['organizerId'] }]
        });
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        if (guest.event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this guest' });
        }

        const updateData = { ...restFields };
        if (req.file) {
            updateData.image = `/uploads/guests/${req.file.filename}`;
            console.log('Using uploaded file for image:', updateData.image);
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            updateData.image = imageFromBody.trim();
            console.log('Using image from body:', updateData.image);
        } else {
            console.log('No image update provided');
        }

        await guest.update(updateData);
        console.log('Guest updated successfully:', guest.toJSON());
        return res.status(200).json(guest);
    } catch (error) {
        console.error('Error updating guest:', error);
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
            message: 'Error updating guest',
            error: error.message
        });
    }
};

// Delete a guest
export const deleteGuest = async (req, res) => {
    try {
        const { id } = req.params;
        
        const guest = await Guest.findByPk(id, {
            include: [{
                model: Event,
                as: 'event',
                attributes: ['organizerId']
            }]
        });
        
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }
        
        // Check if user is authorized (event organizer or admin)
        if (guest.event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this guest' });
        }
        
        await guest.destroy();
        res.status(200).json({ message: 'Guest deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting guest', error: error.message });
    }
}; 