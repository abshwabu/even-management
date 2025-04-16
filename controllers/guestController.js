import Guest from '../models/Guest.js';
import Event from '../models/Event.js';
import upload from '../middleware/upload.js';

// Get all guests for an event
export const getEventGuests = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        const guests = await Guest.findAll({
            where: { eventId },
            order: [['createdAt', 'ASC']]
        });
        
        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching guests', error: error.message });
    }
};

// Add a guest to an event
export const addGuest = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Check if event exists
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check if user is authorized (event organizer or admin)
        if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to add guests to this event' });
        }
        
        const guestData = {
            ...req.body,
            eventId,
            image: req.file ? `/uploads/guests/${req.file.filename}` : null
        };
        
        const guest = await Guest.create(guestData);
        res.status(201).json(guest);
    } catch (error) {
        res.status(400).json({ message: 'Error adding guest', error: error.message });
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