import { Router } from 'express';

import Paths from '@src/common/constants/Paths';

import UserRoutes from './UserRoutes';

import AuthRoutes from './AuthRoutes';

import { requireAdmin } from '@src/common/middleware/authMiddleware';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ----------------------- Add UserRouter --------------------------------- //

const userRouter = Router();

userRouter.use(requireAdmin);

userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

apiRouter.use(Paths.Users._, userRouter);


// ----------------------- Add AuthRouter --------------------------------- //

const authRouter = Router();

authRouter.post(Paths.Auth.Register, AuthRoutes.register);
authRouter.post(Paths.Auth.Login, AuthRoutes.login);
authRouter.post('/admin-login', AuthRoutes.adminLogin);
authRouter.post(Paths.Auth.Refresh, AuthRoutes.refresh);
authRouter.post(Paths.Auth.ForgotPassword, AuthRoutes.forgotPassword);
authRouter.post(Paths.Auth.ResetPassword, AuthRoutes.resetPassword);

apiRouter.use(Paths.Auth._, authRouter);

/******************************************************************************
                                Export
******************************************************************************/

export default apiRouter;