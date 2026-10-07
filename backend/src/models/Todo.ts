import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  type: { type: String, default: 'custom' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Todo', todoSchema);
