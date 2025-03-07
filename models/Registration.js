import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "confirmed", "canceled"], default: "pending" },
    paymentMethod: { type: String, enum: ["credit_card", "paypal", "bank_transfer"], required: function() { return this.isPaid; } }
});

export default mongoose.model("Registration", registrationSchema);
