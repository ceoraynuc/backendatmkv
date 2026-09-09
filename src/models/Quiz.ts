import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  subjectId: mongoose.Types.ObjectId;
}

const QuizSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;