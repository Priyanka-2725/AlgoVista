import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  photoURL: { type: String },
  bio: { type: String },
  xp: { type: Number, default: 0 },
  skillRating: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  lastSolvedDate: { type: String },
  joinedAt: { type: Date, default: Date.now },
  weakTopics: [{ type: String }],
  achievements: [{ type: String }],
  battleEnergy: { type: Number, default: 10 },
  lastEnergyUpdate: { type: Date, default: Date.now },
  problemsSolved: { type: Number, default: 0 },
});

export default mongoose.model('User', userSchema);
