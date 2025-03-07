import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    location: { type: String },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    status: { type: String, enum: ["upcoming", "ongoing", "completed", "canceled"], default: "upcoming" },
    isPaid: { type: Boolean, default: false },
    paidAmount: { type: Number, default: 0, required: function() { return this.isPaid; }},
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String, enum: ["daily", "weekly", "monthly", "yearly", "none"], default: "none" },
    createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
