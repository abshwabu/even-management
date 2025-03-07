import express from 'express';
const router = express.Router();
import Payment from '../models/Payment.js'; // Adjust the path as necessary

// Create a new payment
router.post('/', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        res.status(201).send(payment);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find({});
        res.status(200).send(payments);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a payment by ID
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).send();
        }
        res.status(200).send(payment);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a payment by ID
router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['registration', 'amount', 'paymentStatus', 'paymentMethod', 'transactionId']; // Adjust fields as necessary
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).send();
        }

        updates.forEach((update) => payment[update] = req.body[update]);
        await payment.save();
        res.status(200).send(payment);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a payment by ID
router.delete('/:id', async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).send();
        }
        res.status(200).send(payment);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;