import mongoose from 'mongoose';

const dailyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g. YYYY-MM-DD
  tasks: [{
    id: { type: String },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    type: { type: String, default: 'general' },
    linkedId: { type: String },
    difficulty: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('DailyPlan', dailyPlanSchema);
