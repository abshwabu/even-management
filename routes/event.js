import express from 'express';
import Event from '../models/Event.js';
import Calendar from '../models/Calendar.js';
import Notification from '../models/Notification.js';
import {auth, restrictTo} from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDateTime
 *               - endDateTime
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDateTime:
 *                 type: string
 *                 format: date-time
 *               endDateTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, canceled]
 *               isPaid:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
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

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({});
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDateTime:
 *                 type: string
 *                 format: date-time
 *               endDateTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, canceled]
 *               isPaid:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', auth, restrictTo(['admin', 'organizer']), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'startDateTime', 'endDateTime', 'location', 'visibility', 'status', 'isPaid'];
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

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, restrictTo(['admin', 'organizer']), async (req, res) => {
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