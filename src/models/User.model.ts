import mongoose, { Document, Model } from 'mongoose';

export type UserRole = 'student' | 'volunteer' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  created: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['student', 'volunteer', 'admin'],
      default: 'student',
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    resetTokenHash: {
      type: String,
    },

    resetTokenExpiresAt: {
      type: Date,
    },

    created: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'users',
  },
);

const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;