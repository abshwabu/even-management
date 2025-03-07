import express from 'express';
const router = express.Router();
import Calendar from '../models/Calendar.js';

// Create a new calendar entry
router.post('/', async (req, res) => {
    try {
        const calendar = new Calendar(req.body);
        await calendar.save();
        res.status(201).send(calendar);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all calendar entries
router.get('/', async (req, res) => {
    try {
        const calendars = await Calendar.find({});
        res.status(200).send(calendars);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a calendar entry by ID
router.get('/:id', async (req, res) => {
    try {
        const calendar = await Calendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).send();
        }
        res.status(200).send(calendar);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a calendar entry by ID
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['event', 'startDate', 'endDate', 'startTime', 'endTime', 'isRecurring', 'recurrencePattern']; // Adjust fields as necessary
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const calendar = await Calendar.findById(req.params.id);
        if (!calendar) {
            return res.status(404).send();
        }

        updates.forEach((update) => calendar[update] = req.body[update]);
        await calendar.save();
        res.status(200).send(calendar);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a calendar entry by ID
router.delete('/:id', async (req, res) => {
    try {
        const calendar = await Calendar.findByIdAndDelete(req.params.id);
        if (!calendar) {
            return res.status(404).send();
        }
        res.status(200).send(calendar);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;