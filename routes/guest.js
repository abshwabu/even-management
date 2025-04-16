import express from 'express';
import { auth, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getEventGuests,
    addGuest,
    updateGuest,
    deleteGuest
} from '../controllers/guestController.js';

const router = express.Router();

// Configure upload for guest images
const guestUpload = upload.single('image');

/**
 * @swagger
 * tags:
 *   name: Guests
 *   description: Event guest management endpoints
 */

/**
 * @swagger
 * /api/events/{eventId}/guests:
 *   get:
 *     summary: Get all guests for an event
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: List of guests
 *       500:
 *         description: Server error
 */
router.get('/events/:eventId/guests', getEventGuests);

/**
 * @swagger
 * /api/events/{eventId}/guests:
 *   post:
 *     summary: Add a guest to an event
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               profession:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Guest added successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Event not found
 */
router.post('/events/:eventId/guests', auth, restrictTo(['admin', 'organizer']), guestUpload, addGuest);

/**
 * @swagger
 * /api/guests/{id}:
 *   put:
 *     summary: Update a guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Guest ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               profession:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Guest updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Guest not found
 */
router.put('/guests/:id', auth, restrictTo(['admin', 'organizer']), guestUpload, updateGuest);

/**
 * @swagger
 * /api/guests/{id}:
 *   delete:
 *     summary: Delete a guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Guest ID
 *     responses:
 *       200:
 *         description: Guest deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Guest not found
 */
router.delete('/guests/:id', auth, restrictTo(['admin', 'organizer']), deleteGuest);

export default router; 