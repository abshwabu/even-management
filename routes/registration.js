import express from 'express';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import initializePayment from '../utils/chapa.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create a new registration
router.post('/', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.body.event);
        if (!event) {
            return res.status(404).send({ error: 'Event not found' });
        }

        if (event.isPaid) {
            if (!req.body.paymentMethod) {
                return res.status(400).send({ error: 'Payment method is required for paid events' });
            }

            const paymentData = {
                amount: req.body.amount, // Ensure this is passed in the request body
                currency: 'ETB',
                email: req.user.email,
                first_name: req.user.name.split(' ')[0],
                last_name: req.user.name.split(' ')[1] || '',
                tx_ref: `tx-${Date.now()}`,
                callback_url: 'http://localhost:3000/api/registrations/callback', // Adjust as necessary
                return_url: 'http://localhost:3000/api/registrations/return', // Adjust as necessary
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

        const registration = new Registration({
            ...req.body,
            user: req.user._id
        });
        await registration.save();
        res.status(201).send(registration);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get all registrations
router.get('/', async (req, res) => {
    try {
        const registrations = await Registration.find({});
        res.status(200).send(registrations);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a registration by ID
router.get('/:id', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).send();
        }
        res.status(200).send(registration);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a registration by ID
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['user', 'event', 'registrationDate', 'status']; // Adjust fields as necessary
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) {
            return res.status(404).send();
        }

        updates.forEach((update) => registration[update] = req.body[update]);
        await registration.save();
        res.status(200).send(registration);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a registration by ID
router.delete('/:id', async (req, res) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);
        if (!registration) {
            return res.status(404).send();
        }
        res.status(200).send(registration);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;