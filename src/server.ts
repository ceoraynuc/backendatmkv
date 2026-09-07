import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose'; // <-- Mongoose import kiya

import Paths from '@src/common/constants/Paths';
import { RouteError } from '@src/common/utils/route-errors';
import BaseRouter from '@src/routes/apiRouter';

import EnvVars, { NodeEnvs } from './common/constants/env';

import cookieParser from 'cookie-parser';
import { requireAdminPage } from './common/middleware/authMiddleware';

import subjectRoutes from './routes/subjects'; // <-- Subject routes import kiya

/******************************************************************************
                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.DEV) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// **** Database Connection **** //
// MongoDB Atlas connection setup
const MONGO_URI = process.env.MONGO_URI || '';
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected successfully!'))
  .catch((err) => logger.err(err, true));


// **** Routes Registration **** //

// Add APIs, must be after middleware
app.use(Paths._, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.TEST.valueOf()) {
    logger.err(err, true);
  }
  if (err instanceof RouteError) {
    res.status(err.status).json({ error: err.message });
  }
  return next(err);
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Landing page for the backend dashboard
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/admin');
});

// Admin dashboard frontend
app.get('/admin/logout', (_: Request, res: Response) => {
  res.clearCookie('admin_access_token');
  return res.redirect('/admin/login');
});

app.get('/admin/login', (_: Request, res: Response) => {
  return res.sendFile('admin-login.html', { root: viewsDir });
});

app.get('/admin/forgot-password', (_: Request, res: Response) => {
  return res.sendFile('admin-forgot-password.html', { root: viewsDir });
});

app.get('/admin/reset-password', (_: Request, res: Response) => {
  return res.sendFile('admin-reset-password.html', { root: viewsDir });
});

app.get(
  '/admin',
  requireAdminPage,
  (_: Request, res: Response) => {
    return res.sendFile('admin.html', { root: viewsDir });
  },
);

app.get(
  '/admin/dashboard',
  requireAdminPage,
  (_: Request, res: Response) => {
    return res.sendFile('admin.html', { root: viewsDir });
  },
);

// Existing user page remains available for the API demo UI
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

/******************************************************************************
                Export default
******************************************************************************/

export default app;