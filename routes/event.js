import express from 'express';
import { auth, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import pagination from '../middleware/pagination.js';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} from '../controllers/eventController.js';

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDateTime
 *               - endDateTime
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
 *               mainImage:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               isPaid:
 *                 type: boolean
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *               recurrencePattern:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly, none]
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid input
 */
const uploadFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

router.post('/', auth, restrictTo(['admin', 'organizer']), uploadFields, createEvent);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, canceled]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of events with pagination
 *       500:
 *         description: Server error
 */
router.get('/', pagination, getAllEvents);

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
router.get('/:id', getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     summary: Update an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *       - in: query
 *         name: append
 *         schema:
 *           type: boolean
 *         description: If true, append new images to existing ones
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               mainImage:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to edit this event
 *       404:
 *         description: Event not found
 */
router.put('/:id', auth, restrictTo(['admin', 'organizer']), uploadFields, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this event
 *       404:
 *         description: Event not found
 */
router.delete('/:id', auth, restrictTo(['admin', 'organizer']), deleteEvent);

export default router;