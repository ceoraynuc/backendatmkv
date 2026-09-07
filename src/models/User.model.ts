// import { isNonEmptyString, isString, isUnsignedInteger } from 'jet-validators';
// import { parseObject, Schema, testObject } from 'jet-validators/utils';

// import { transformIsDate } from '@src/common/utils/validators';

// import { Entity } from './common/types';

// /******************************************************************************
//                                  Constants
// ******************************************************************************/

// const GetDefaults = (): IUser => ({
//   id: 0,
//   name: '',
//   email: '',
//   created: new Date(),
// });

// const schema: Schema<IUser> = {
//   id: isUnsignedInteger,
//   name: isString,
//   email: isString,
//   created: transformIsDate,
// };

// /******************************************************************************
//                                   Types
// ******************************************************************************/

// /**
//  * @entity users
//  */
// export type UserRole = 'student' | 'volunteer' | 'admin';
// export type UserStatus = 'active' | 'blocked';

// export interface IUser extends Entity {
//   name: string;
//   email: string;
//   passwordHash?: string;
//   role?: UserRole;
//   status?: UserStatus;
//   resetTokenHash?: string;
//   resetTokenExpiresAt?: Date;
// }

// /******************************************************************************
//                                   Setup
// ******************************************************************************/

// // Set the "parseUser" function
// const parseUser = parseObject<IUser>(schema);

// // For the APIs make sure the right fields are complete
// const isCompleteUser = testObject<IUser>({
//   ...schema,
//   name: isNonEmptyString,
//   email: isNonEmptyString,
// });

// /******************************************************************************
//                                  Functions
// ******************************************************************************/

// /**
//  * New user object.
//  */
// function new_(user?: Partial<IUser>): IUser {
//   return parseUser({ ...GetDefaults(), ...user }, (errors) => {
//     throw new Error('Setup new user failed ' + JSON.stringify(errors, null, 2));
//   });
// }

// /******************************************************************************
//                                 Export default
// ******************************************************************************/

// export default {
//   new: new_,
//   isComplete: isCompleteUser,
// } as const;

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