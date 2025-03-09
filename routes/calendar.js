import express from 'express';
import Calendar from '../models/Calendar.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Calendars
 *   description: Calendar management endpoints
 */

/**
 * @swagger
 * /api/calendars:
 *   post:
 *     summary: Create a new calendar entry
 *     tags: [Calendars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - startDate
 *               - endDate
 *               - startTime
 *               - endTime
 *             properties:
 *               event:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly, none]
 *     responses:
 *       201:
 *         description: Calendar entry created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    try {
        const calendar = new Calendar(req.body);
        await calendar.save();
        res.status(201).send(calendar);
    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 * @swagger
 * /api/calendars:
 *   get:
 *     summary: Get all calendar entries
 *     tags: [Calendars]
 *     responses:
 *       200:
 *         description: List of calendar entries
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const calendars = await Calendar.find({});
        res.status(200).send(calendars);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/calendars/{id}:
 *   get:
 *     summary: Get a calendar entry by ID
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar entry ID
 *     responses:
 *       200:
 *         description: Calendar entry details
 *       404:
 *         description: Calendar entry not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/calendars/{id}:
 *   patch:
 *     summary: Update a calendar entry by ID
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly, none]
 *     responses:
 *       200:
 *         description: Calendar entry updated successfully
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: Calendar entry not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['startDate', 'endDate', 'startTime', 'endTime', 'isRecurring', 'recurrencePattern'];
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

/**
 * @swagger
 * /api/calendars/{id}:
 *   delete:
 *     summary: Delete a calendar entry by ID
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Calendar entry ID
 *     responses:
 *       200:
 *         description: Calendar entry deleted successfully
 *       404:
 *         description: Calendar entry not found
 *       500:
 *         description: Server error
 */
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