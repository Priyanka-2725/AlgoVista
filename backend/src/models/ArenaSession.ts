import mongoose, { Document, Schema } from 'mongoose';

export interface IArenaSession extends Document {
  userId: mongoose.Types.ObjectId;
  problemIds: string[];
  status: 'active' | 'completed';
  score: number;
  weakTopicSelected: string;
  timeLeft: number;
  submissions: Record<string, any>;
  feedback?: {
    summary?: string;
    technicalCritique?: string;
    behavioralTip?: string;
    mockScore?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const arenaSessionSchema = new Schema<IArenaSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemIds: [{ type: String, required: true }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  score: { type: Number, default: 0 },
  weakTopicSelected: { type: String },
  timeLeft: { type: Number, default: 2700 },
  submissions: { type: Schema.Types.Mixed, default: {} },
  feedback: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export const ArenaSession = mongoose.models.ArenaSession || mongoose.model<IArenaSession>('ArenaSession', arenaSessionSchema);
