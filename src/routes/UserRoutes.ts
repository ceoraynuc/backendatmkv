import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { IUser } from '@src/models/User.model';
import UserService from '@src/services/UserService';

import { Req, Res } from './common/express-types';

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all users.
 *
 * @route GET /api/users/all
 */
async function getAll(_: Req, res: Res) {
  const users = await UserService.getAll();
  res.status(HttpStatusCodes.OK).json({ users });
}

/**
 * Add one user.
 *
 * @route POST /api/users/add
 */
async function add(req: Req, res: Res) {
  const user = req.body as unknown as IUser;

  await UserService.addOne(user);

  res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Update one user.
 *
 * @route PUT /api/users/update
 */
async function update(req: Req, res: Res) {
const user = req.body as unknown as IUser & { _id?: string };

  await UserService.updateOne(user);

  res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one user.
 *
 * @route DELETE /api/users/delete/:id
 */
async function delete_(req: Req, res: Res) {
  const { id } = req.params;

  await UserService.delete(id);

  res.status(HttpStatusCodes.OK).end();
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  add,
  update,
  delete: delete_,
} as const;