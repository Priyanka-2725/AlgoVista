import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true },
  xpAmount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Activity', activitySchema);
