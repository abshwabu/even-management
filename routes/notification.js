import express from 'express';
const router = express.Router();
import Notification from '../models/Notification.js'; // Adjust the path as necessary

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({});
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a notification by ID
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

// Update a notification by ID
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['user', 'message', 'isRead']; // Adjust fields as necessary
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

// Delete a notification by ID
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