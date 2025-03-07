import mongoose from "mongoose";

const calendarSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    recurrencePattern: { type: String, enum: ["daily", "weekly", "monthly", "yearly", "none"], default: "none" }
  });
  
  export default mongoose.model("Calendar", calendarSchema);
  