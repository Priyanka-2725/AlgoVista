import mongoose, { Document, Schema } from 'mongoose';

export interface IMockSession extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'behavioral' | 'technical';
  role: string;
  company?: string;
  questions: {
    questionText: string;
    answer?: string;
    feedback?: string;
    score?: number;
  }[];
  overallScore?: number;
  overallFeedback?: string;
  status: 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const mockSessionSchema = new Schema<IMockSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['behavioral', 'technical'], required: true },
  role: { type: String, required: true },
  company: { type: String },
  questions: [{
    questionText: { type: String, required: true },
    answer: { type: String },
    feedback: { type: String },
    score: { type: Number }
  }],
  overallScore: { type: Number },
  overallFeedback: { type: String },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' }
}, {
  timestamps: true
});

export const MockSession = mongoose.models.MockSession || mongoose.model<IMockSession>('MockSession', mockSessionSchema);
