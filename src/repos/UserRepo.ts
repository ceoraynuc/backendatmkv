import UserModel, { IUser, IUserDocument } from '@src/models/User.model';

function toUser(user: IUserDocument): IUser {
  return {
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    status: user.status,
    resetTokenHash: user.resetTokenHash,
    resetTokenExpiresAt: user.resetTokenExpiresAt,
    created: user.created,
  };
}

/**
 * Get one user by email.
 */
async function getOne(email: string): Promise<IUser | null> {
  const user = await UserModel.findOne({
    email: email.toLowerCase(),
  }).lean();

  if (!user) {
    return null;
  }

  return user as unknown as IUser;
}

/**
 * See if a user exists by id.
 */
async function persists(id: number): Promise<boolean> {
  return false;
}

/**
 * Get all users.
 */
async function getAll(): Promise<IUser[]> {
  const users = await UserModel.find().lean();

  return users as unknown as IUser[];
}

/**
 * Add one user.
 */
async function add(user: IUser): Promise<void> {
  await UserModel.create(user);
}

/**
 * Update user.
 */
async function update(user: IUser): Promise<void> {
  await UserModel.findOneAndUpdate(
    { email: user.email },
    {
      name: user.name,
      email: user.email,
    },
  );
}

/**
 * Delete user.
 */
async function delete_(id: number): Promise<void> {
  // Old JSON database used numeric IDs.
  // MongoDB now uses _id.
}

/**
 * Update authentication fields.
 */
async function updateAuth(user: IUser): Promise<void> {
  await UserModel.findOneAndUpdate(
    { email: user.email },
    {
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      resetTokenHash: user.resetTokenHash,
      resetTokenExpiresAt: user.resetTokenExpiresAt,
    },
    { new: true },
  );
}

async function deleteAllUsers(): Promise<void> {
  await UserModel.deleteMany({});
}

async function insertMultiple(
  users: IUser[] | readonly IUser[],
): Promise<IUser[]> {
  const created = await UserModel.insertMany([...users]);

  return created.map(toUser);
}

export default {
  getOne,
  persists,
  getAll,
  add,
  update,
  updateAuth,
  delete: delete_,
  deleteAllUsers,
  insertMultiple,
} as const;