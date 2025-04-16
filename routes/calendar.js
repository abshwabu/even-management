import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getAllCalendars,
    getCalendarById,
    createCalendar,
    updateCalendar,
    deleteCalendar
} from '../controllers/calendarController.js';

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
 *   get:
 *     summary: Get all calendar entries
 *     tags: [Calendars]
 *     responses:
 *       200:
 *         description: List of calendar entries
 *       500:
 *         description: Server error
 */
router.get('/', getAllCalendars);

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
 */
router.get('/:id', getCalendarById);

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
 *               - eventId
 *               - startDate
 *               - endDate
 *             properties:
 *               eventId:
 *                 type: integer
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
 */
router.post('/', createCalendar);

/**
 * @swagger
 * /api/calendars/{id}:
 *   patch:
 *     summary: Update a calendar entry
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Calendar entry updated successfully
 */
router.patch('/:id', updateCalendar);

/**
 * @swagger
 * /api/calendars/{id}:
 *   delete:
 *     summary: Delete a calendar entry
 *     tags: [Calendars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Calendar entry deleted successfully
 */
router.delete('/:id', deleteCalendar);

export default router;