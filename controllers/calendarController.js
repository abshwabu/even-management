import Calendar from '../models/Calendar.js';

// Get all calendar entries
export const getAllCalendars = async (req, res) => {
    try {
        const calendars = await Calendar.findAll();
        res.status(200).send(calendars);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get calendar by ID
export const getCalendarById = async (req, res) => {
    try {
        const calendar = await Calendar.findByPk(req.params.id);
        if (!calendar) {
            return res.status(404).send({ error: 'Calendar entry not found' });
        }
        res.status(200).send(calendar);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Create calendar entry
export const createCalendar = async (req, res) => {
    try {
        const calendar = await Calendar.create(req.body);
        res.status(201).send(calendar);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Update calendar entry
export const updateCalendar = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['startDate', 'endDate', 'startTime', 'endTime', 'isRecurring', 'recurrencePattern'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const calendar = await Calendar.findByPk(req.params.id);
        if (!calendar) {
            return res.status(404).send({ error: 'Calendar entry not found' });
        }

        updates.forEach((update) => calendar[update] = req.body[update]);
        await calendar.save();
        res.status(200).send(calendar);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Delete calendar entry
export const deleteCalendar = async (req, res) => {
    try {
        const deleted = await Calendar.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).send({ error: 'Calendar entry not found' });
        }
        res.status(200).send({ message: 'Calendar entry deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}; 