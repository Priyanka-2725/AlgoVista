import mongoose from 'mongoose';

const learningStepSchema = new mongoose.Schema({
  type: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  recommendedTask: { type: String, required: true }
}, { _id: false });

const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  recommendedSteps: [learningStepSchema],
  currentStepIndex: { type: Number, default: 0 },
  completedStepIndices: [{ type: Number }],
  generatedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('LearningPath', learningPathSchema);
