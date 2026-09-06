import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import AuthService from '@src/services/AuthService';

import { Req, Res } from './common/express-types';

/******************************************************************************
                              Types
******************************************************************************/

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'volunteer' | 'admin';
};

type LoginBody = {
  email?: string;
  password?: string;
};

type RefreshBody = {
  refreshToken?: string;
};


type ForgotPasswordBody = {
  email?: string;
};

type ResetPasswordBody = {
  token?: string;
  newPassword?: string;
};

/******************************************************************************
                              Helpers
******************************************************************************/

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/******************************************************************************
                              Register
******************************************************************************/

/**
 * Register a new user.
 *
 * @route POST /api/auth/register
 */
async function register(req: Req, res: Res) {
  const { name, email, password, role } = req.body as RegisterBody;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Name, email and password are required',
    });
  }

  if (!isValidEmail(email)) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Invalid email address',
    });
  }

  if (password.length < 8) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Password must be at least 8 characters',
    });
  }

  const userRole = role ?? 'student';

  if (!['student', 'volunteer', 'admin'].includes(userRole)) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Invalid role',
    });
  }

  const result = await AuthService.register(
    name.trim(),
    email.trim().toLowerCase(),
    password,
    userRole,
  );

  return res.status(HttpStatusCodes.CREATED).json(result);
}

/******************************************************************************
                                Login
******************************************************************************/

/**
 * Login user.
 *
 * @route POST /api/auth/login
 */
async function login(req: Req, res: Res) {
  const { email, password } = req.body as LoginBody;

  if (!email?.trim() || !password) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Email and password are required',
    });
  }

  const result = await AuthService.login(
    email.trim().toLowerCase(),
    password,
  );

  return res.status(HttpStatusCodes.OK).json(result);
}


/**
 * Login admin.
 *
 * @route POST /api/auth/login
 */

async function adminLogin(req: Req, res: Res) {
  const { email, password } = req.body as LoginBody;

  if (!email?.trim() || !password) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Email and password are required',
    });
  }

  const result = await AuthService.login(
    email.trim().toLowerCase(),
    password,
  );

  if (result.user.role !== 'admin') {
    return res.status(HttpStatusCodes.FORBIDDEN).json({
      error: 'Admin access required',
    });
  }

  res.cookie('admin_access_token', result.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000,
  });

  return res.status(HttpStatusCodes.OK).json({
    message: 'Admin login successful',
    user: result.user,
  });
}


/******************************************************************************
                            Refresh Token
******************************************************************************/

/**
 * Refresh access token.
 *
 * @route POST /api/auth/refresh
 */
async function refresh(req: Req, res: Res) {
  const { refreshToken } = req.body as RefreshBody;

  if (!refreshToken) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Refresh token is required',
    });
  }

  const result = await AuthService.refresh(refreshToken);

  return res.status(HttpStatusCodes.OK).json(result);
}


/****************************************************************************** 
                            Forgot Password
******************************************************************************/

/**
 * Request password reset.
 *
 * @route POST /api/auth/forgot-password
 */
async function forgotPassword(req: Req, res: Res) {
  const { email } = req.body as ForgotPasswordBody;

  if (!email?.trim()) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Email is required',
    });
  }

  const resetToken = await AuthService.forgotPassword(
    email.trim().toLowerCase(),
  );

  return res.status(HttpStatusCodes.OK).json({
    message: 'If the email exists, a password reset link has been generated.',
    resetToken,
  });
}

/****************************************************************************** 
                            Reset Password
******************************************************************************/

/**
 * Reset password.
 *
 * @route POST /api/auth/reset-password
 */
async function resetPassword(req: Req, res: Res) {
  const { token, newPassword } = req.body as ResetPasswordBody;

  if (!token || !newPassword) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Token and new password are required',
    });
  }

  if (newPassword.length < 8) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: 'Password must be at least 8 characters',
    });
  }

  await AuthService.resetPassword(token, newPassword);

  return res.status(HttpStatusCodes.OK).json({
    message: 'Password reset successfully',
  });
}

/******************************************************************************
                                Export
******************************************************************************/

export default {
  register,
  login,
  adminLogin,
  refresh,
  forgotPassword,
  resetPassword,
} as const;