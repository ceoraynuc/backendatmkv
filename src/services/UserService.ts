import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import UserModel, { IUser } from '@src/models/User.model';

/******************************************************************************
                                Constants
******************************************************************************/

const Errors = {
  USER_NOT_FOUND: 'User not found',
} as const;

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all users.
 */
async function getAll(): Promise<Partial<IUser>[]> {
  const users = await UserModel.find()
    .select('-passwordHash -resetTokenHash -resetTokenExpiresAt')
    .lean();

  return users as unknown as Partial<IUser>[];
}

/**
 * Add one user.
 */
async function addOne(user: IUser): Promise<void> {
  await UserModel.create(user);
}

/**
 * Update one user.
 */
async function updateOne(user: IUser & { _id?: string }): Promise<void> {
  if (!user._id) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'User id is required',
    );
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.USER_NOT_FOUND,
    );
  }
}

/**
 * Delete a user by their MongoDB id.
 */
async function deleteOne(id: string): Promise<void> {
  const deletedUser = await UserModel.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.USER_NOT_FOUND,
    );
  }
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  Errors,
  getAll,
  addOne,
  updateOne,
  delete: deleteOne,
} as const;