import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  quizId: mongoose.Types.ObjectId;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

const QuestionSchema: Schema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length >= 2,
        message: 'A question must have at least 2 options',
      },
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,
    },

    explanation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;