import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - message
 *             properties:
 *               user:
 *                 type: string
 *               message:
 *                 type: string
 *               isRead:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({});
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).send();
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Update a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               isRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       400:
 *         description: Invalid updates
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['message', 'isRead'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).send();
        }

        updates.forEach((update) => notification[update] = req.body[update]);
        await notification.save();
        res.status(200).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).send();
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;