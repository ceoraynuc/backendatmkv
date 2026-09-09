import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  chapterNumber: number;
  contentUrl?: string; 
}

export const ChapterSchema: Schema = new Schema({
  title: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  contentUrl: { type: String },
});

// Subject Schema
export interface ISubject extends Document {
  name: string;
  description: string;
  code: string;
  chapters: IChapter[];
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  chapters: [ChapterSchema],
}, { timestamps: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);