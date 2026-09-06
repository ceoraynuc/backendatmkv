import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type JwtPayload = {
    sub: string;
    email?: string;
    role?: 'student' | 'volunteer' | 'admin';
    type?: 'access' | 'refresh';
};

function getToken(req: Request): string | null {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return req.cookies?.admin_access_token ?? null;
}

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const token = getToken(req);

    if (!token) {
        res.status(401).json({
            error: 'Authentication required',
        });
        return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            error: 'JWT secret is not configured',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (decoded.type !== 'access') {
            res.status(401).json({
                error: 'Invalid access token',
            });
            return;
        }

        (req as Request & { user?: JwtPayload }).user = decoded;

        next();
    } catch {
        res.status(401).json({
            error: 'Invalid or expired token',
        });
    }
}

export function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const token = getToken(req);

    if (!token) {
        res.status(401).json({
            error: 'Admin authentication required',
        });
        return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.status(500).json({
            error: 'JWT secret is not configured',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (decoded.type !== 'access') {
            res.status(401).json({
                error: 'Invalid access token',
            });
            return;
        }

        if (decoded.role !== 'admin') {
            res.status(403).json({
                error: 'Admin access required',
            });
            return;
        }

        (req as Request & { user?: JwtPayload }).user = decoded;

        next();
    } catch {
        res.status(401).json({
            error: 'Invalid or expired token',
        });
    }
}


export function requireAdminPage(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const token = req.cookies?.admin_access_token;

    if (!token) {
        res.redirect('/admin/login');
        return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        res.redirect('/admin/login');
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;

        if (decoded.type !== 'access' || decoded.role !== 'admin') {
            res.clearCookie('admin_access_token');
            res.redirect('/admin/login');
            return;
        }

        next();
    } catch {
        res.clearCookie('admin_access_token');
        res.redirect('/admin/login');
    }
}