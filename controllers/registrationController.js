import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import initializePayment from '../utils/chapa.js';
import User from '../models/User.js';

// Get all registrations with optional stats
export const getAllRegistrations = async (req, res) => {
    try {
        const { includeStats } = req.query;
        
        const registrations = await Registration.findAll({
            include: [
                { model: User, as: 'user' },
                { model: Event, as: 'event' }
            ]
        });
        
        // If includeStats is true, include registration statistics
        let response = registrations;
        
        if (includeStats === 'true') {
            // Get registration statistics
            const totalRegistrations = await Registration.count();
            const paidRegistrations = await Registration.count({
                include: [{
                    model: Event,
                    as: 'event',
                    where: {
                        isPaid: true
                    }
                }]
            });
            const freeRegistrations = totalRegistrations - paidRegistrations;
            
            response = {
                registrations,
                stats: {
                    totalRegistrations,
                    paidRegistrations,
                    freeRegistrations
                }
            };
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting registrations:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get registration by ID
export const getRegistrationById = async (req, res) => {
    try {
        const registration = await Registration.findByPk(req.params.id);
        if (!registration) {
            return res.status(404).send({ error: 'Registration not found' });
        }
        res.status(200).send(registration);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Create registration
export const createRegistration = async (req, res) => {
    try {
        const event = await Event.findByPk(req.body.event);
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }

        if (event.isPaid) {
            if (!req.body.paymentMethod) {
                return res.status(400).send({ error: 'Payment method is required for paid events' });
            }

            const paymentData = {
                amount: req.body.amount,
                currency: 'ETB',
                email: req.user.email,
                first_name: req.user.name.split(' ')[0],
                last_name: req.user.name.split(' ')[1] || '',
                tx_ref: `tx-${Date.now()}`,
                callback_url: 'https://event-management-zk4x.onrender.com/api/registrations/callback',
                return_url: 'https://event-management-zk4x.onrender.com/api/registrations/return',
                customization: {
                    title: 'Event Registration Payment',
                    description: `Payment for event: ${event.title}`
                }
            };

            const paymentResponse = await initializePayment(paymentData);
            if (paymentResponse.status !== 'success') {
                return res.status(400).send({ error: 'Payment initialization failed' });
            }

            req.body.paymentReference = paymentResponse.data.tx_ref;
        }

        const registration = await Registration.create({
            ...req.body,
            userId: req.user.id,
            eventId: req.body.event
        });
        res.status(201).send(registration);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Update registration
export const updateRegistration = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['status', 'paymentMethod', 'paymentReference'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const registration = await Registration.findByPk(req.params.id);
        if (!registration) {
            return res.status(404).send({ error: 'Registration not found' });
        }

        updates.forEach((update) => registration[update] = req.body[update]);
        await registration.save();
        res.status(200).send(registration);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Delete registration
export const deleteRegistration = async (req, res) => {
    try {
        const deletedCount = await Registration.destroy({ where: { id: req.params.id } });
        if (!deletedCount) {
            return res.status(404).send({ error: 'Registration not found' });
        }
        res.status(200).send({ message: 'Registration deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}; 