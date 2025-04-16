import Payment from '../models/Payment.js';

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        res.status(200).send(payments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).send({ error: 'Payment not found' });
        }
        res.status(200).send(payment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Create payment
export const createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).send(payment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Update payment
export const updatePayment = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['amount', 'paymentMethod', 'paymentStatus'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).send({ error: 'Payment not found' });
        }

        updates.forEach((update) => payment[update] = req.body[update]);
        await payment.save();
        res.status(200).send(payment);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

// Delete payment
export const deletePayment = async (req, res) => {
    try {
        const deletedCount = await Payment.destroy({ where: { id: req.params.id } });
        if (!deletedCount) {
            return res.status(404).send({ error: 'Payment not found' });
        }
        res.status(200).send({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}; 