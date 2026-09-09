import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  completedChapters: mongoose.Types.ObjectId[]; 
  quizScores: {
    quizId: mongoose.Types.ObjectId;
    score: number;
    totalQuestions: number;
    submittedAt: Date;
  }[];
  streak: number;
  lastActiveDate: Date;
}

const ProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedChapters: [{ type: Schema.Types.ObjectId, ref: 'Subject.chapters' }],
  quizScores: [
    {
      quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
      score: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      submittedAt: { type: Date, default: Date.now }
    }
  ],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);