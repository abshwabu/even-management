import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    updateRegistration,
    deleteRegistration
} from '../controllers/registrationController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Registration management endpoints
 */

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Create a new registration
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *             properties:
 *               event:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer]
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Registration created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', createRegistration);

/**
 * @swagger
 * /api/registrations:
 *   get:
 *     summary: Get all registrations
 *     tags: [Registrations]
 *     responses:
 *       200:
 *         description: List of registrations
 *       500:
 *         description: Server error
 */
router.get('/', getAllRegistrations);

/**
 * @swagger
 * /api/registrations/{id}:
 *   get:
 *     summary: Get a registration by ID
 *     tags: [Registrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details
 *       404:
 *         description: Registration not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRegistrationById);

/**
 * @swagger
 * /api/registrations/{id}:
 *   patch:
 *     summary: Update a registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, canceled]
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer]
 *               paymentReference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registration updated successfully
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: Registration not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateRegistration);

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Delete a registration by ID
 *     tags: [Registrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration deleted successfully
 *       404:
 *         description: Registration not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteRegistration);

export default router;