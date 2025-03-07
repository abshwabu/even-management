import express from 'express';
import Event from '../models/Event.js';
import Calendar from '../models/Calendar.js';
import Notification from '../models/Notification.js';
import {auth, restrictTo} from '../middleware/auth.js';

const router = express.Router();

// Create a new event
router.post('/', auth, restrictTo(['admin', 'organizer']), async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            organizer: req.user._id
        });
        await event.save();

        // Create a calendar entry
        const calendar = new Calendar({
            event: event._id,
            startDate: event.startDateTime,
            endDate: event.endDateTime,
            startTime: event.startDateTime.toTimeString().split(' ')[0],
            endTime: event.endDateTime.toTimeString().split(' ')[0],
            isRecurring: event.isRecurring,
            recurrencePattern: event.recurrencePattern
        });
        await calendar.save();

        // Create a notification
        const notification = new Notification({
            user: event.organizer,
            message: `There is a new event: ${event.title}`,
            isRead: false
        });
        await notification.save();

        res.status(201).send(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({});
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get an event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send();
        }
        res.status(200).send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update an event by ID
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'organizer', 'startDateTime', 'endDateTime', 'location', 'visibility', 'status']; // Adjust fields as necessary
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send();
        }

        updates.forEach((update) => event[update] = req.body[update]);
        await event.save();
        res.status(200).send(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete an event by ID
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).send();
        }
        res.status(200).send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;