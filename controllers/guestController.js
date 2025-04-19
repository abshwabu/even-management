import Guest from '../models/Guest.js';
import Event from '../models/Event.js';
import upload from '../middleware/upload.js';

// Get all guests
export const getAllGuests = async (req, res) => {
    try {
        const guests = await Guest.findAll({
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
        const { eventId } = req.params;
        const { name, profession, description } = req.body;
        
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Handle file upload if there's a photo
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/guests/${req.file.filename}`;
        }
        
        const guest = await Guest.create({
            name,
            profession,
            description,
            image: imagePath,
            eventId
        });
        
        res.status(201).json(guest);
    } catch (error) {
        console.error('Error creating guest:', error);
        res.status(400).json({ 
            message: 'Error creating guest', 
            error: error.message 
        });
    }
};

// Update a guest
export const updateGuest = async (req, res) => {
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
            return res.status(403).json({ message: 'Not authorized to update this guest' });
        }
        
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/guests/${req.file.filename}`;
        }
        
        await guest.update(updateData);
        res.status(200).json(guest);
    } catch (error) {
        res.status(400).json({ message: 'Error updating guest', error: error.message });
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