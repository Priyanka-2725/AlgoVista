import mongoose, { Document, Schema } from 'mongoose';

export interface IAIMentorAdvice extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  recommendedAction: string;
  actionUrl: string;
  type: 'study' | 'practice' | 'battle' | 'visualization';
  category: string;
  generatedAt: Date;
}

const aiMentorAdviceSchema = new Schema<IAIMentorAdvice>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  actionUrl: { type: String, required: true },
  type: { type: String, enum: ['study', 'practice', 'battle', 'visualization'], required: true },
  category: { type: String, default: 'General' },
  generatedAt: { type: Date, default: Date.now }
});

export const AIMentorAdvice = mongoose.models.AIMentorAdvice || mongoose.model<IAIMentorAdvice>('AIMentorAdvice', aiMentorAdviceSchema);
