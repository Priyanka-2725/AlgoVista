import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  xpReward: { type: Number, default: 50 },
  date: { type: String, required: true }, // YYYY-MM-DD
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('DailyChallenge', dailyChallengeSchema);
