import Notification from '../models/Notification.js';

// Get all notifications
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll();
        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get notification by ID
export const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).send({ error: 'Notification not found' });
        }
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Create notification
export const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Update notification
export const updateNotification = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['message', 'isRead'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).send({ error: 'Notification not found' });
        }

        updates.forEach((update) => notification[update] = req.body[update]);
        await notification.save();
        res.status(200).send(notification);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const deletedCount = await Notification.destroy({ where: { id: req.params.id } });
        if (!deletedCount) {
            return res.status(404).send({ error: 'Notification not found' });
        }
        res.status(200).send({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}; 