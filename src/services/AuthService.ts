import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { IUser, UserRole } from '@src/models/User.model';
import UserRepo from '@src/repos/UserRepo';

import { sendResetEmail } from '@src/services/EmailService';
/******************************************************************************
                                Constants
******************************************************************************/

const Errors = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  INVALID_ROLE: 'Invalid role',
  MISSING_JWT_SECRET: 'JWT secret is not configured',

  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
} as const;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      Errors.MISSING_JWT_SECRET,
    );
  }

  return secret;
}

/******************************************************************************
                              Types
******************************************************************************/

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

/******************************************************************************
                              Helpers
******************************************************************************/

function createAccessToken(user: IUser): string {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      type: 'access',
    },
    getJwtSecret(),
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  );
}

function createRefreshToken(user: IUser): string {
  return jwt.sign(
    {
      sub: String(user.id),
      type: 'refresh',
    },
    getJwtSecret(),
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  );
}

function createAuthResponse(user: IUser): AuthResponse {
  if (!user.role) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

/******************************************************************************
                              Register
******************************************************************************/

async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'student',
): Promise<AuthResponse> {
  const existingUser = await UserRepo.getOne(email);

  if (existingUser) {
    throw new RouteError(
      HttpStatusCodes.CONFLICT,
      Errors.EMAIL_EXISTS,
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user: IUser = {
    id: 0,
    name,
    email,
    passwordHash,
    role,
    created: new Date(),
  };

  await UserRepo.add(user);

  return createAuthResponse(user);
}

/******************************************************************************
                                Login
******************************************************************************/

async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const user = await UserRepo.getOne(email);

  if (!user || !user.passwordHash || !user.role) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_CREDENTIALS,
    );
  }

  return createAuthResponse(user);
}

/******************************************************************************
                              Refresh Token
******************************************************************************/

function refresh(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, getJwtSecret());

    if (
      typeof payload === 'string' ||
      payload.type !== 'refresh' ||
      !payload.sub
    ) {
      throw new Error('Invalid refresh token');
    }

    const userId = Number(payload.sub);

    return UserRepo.getAll().then((users) => {
      const user = users.find((item) => item.id === userId);

      if (!user || !user.role) {
        throw new RouteError(
          HttpStatusCodes.UNAUTHORIZED,
          Errors.INVALID_REFRESH_TOKEN,
        );
      }

      return {
        accessToken: createAccessToken(user),
      };
    });
  } catch {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      Errors.INVALID_REFRESH_TOKEN,
    );
  }
}


/****************************************************************************** 
                              Forgot Password
******************************************************************************/

async function forgotPassword(email: string): Promise<string | null> {
  const user = await UserRepo.getOne(email);

  if (!user) {
    return null;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const resetTokenExpiresAt = new Date(
    Date.now() + 15 * 60 * 1000,
  );

  await UserRepo.updateAuth({
    ...user,
    resetTokenHash,
    resetTokenExpiresAt,
  });

  const resetLink =
    `http://localhost:3001/admin/reset-password?token=` +
    encodeURIComponent(resetToken);

  await sendResetEmail(user.email, resetLink);

  return resetToken;
}


/****************************************************************************** 
                              Reset Password
******************************************************************************/

async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const users = await UserRepo.getAll();

  const user = users.find(
    (item) =>
      item.resetTokenHash === tokenHash &&
      item.resetTokenExpiresAt &&
      new Date(item.resetTokenExpiresAt).getTime() > Date.now(),
  );

  if (!user) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_RESET_TOKEN,
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await UserRepo.updateAuth({
    ...user,
    passwordHash,
    resetTokenHash: undefined,
    resetTokenExpiresAt: undefined,
  });
}

/******************************************************************************
                                Export
******************************************************************************/

export default {
  Errors,
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
} as const;