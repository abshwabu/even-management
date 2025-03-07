import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    registration: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: true },
    transactionId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
