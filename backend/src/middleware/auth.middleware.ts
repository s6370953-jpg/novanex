import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { findUserById } from '../services/user.service';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

interface AuthTokenPayload extends JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
};

export const validateAuthConfiguration = (): void => {
  getJwtSecret();
  getTokenLifetimeSeconds();
};

const getTokenLifetimeSeconds = (): number => {
  const lifetime = process.env.JWT_EXPIRES_IN || '7d';
  const match = /^([1-9]\d{0,3})(s|m|h|d)$/.exec(lifetime);
  if (!match) {
    throw new Error('JWT_EXPIRES_IN must be a positive duration in seconds, minutes, hours, or days');
  }
  const amount = Number(match[1]);
  const unitSeconds: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * unitSeconds[match[2]];
};

export const generateToken = (userId: number, email: string, role: UserRole): string => {
  return jwt.sign(
    { userId, email, role },
    getJwtSecret(),
    { expiresIn: getTokenLifetimeSeconds(), algorithm: 'HS256' }
  );
};

export const verifyToken = (token: string): AuthTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'number' ||
      typeof decoded.email !== 'string' ||
      (decoded.role !== 'student' && decoded.role !== 'admin')
    ) {
      return null;
    }
    return decoded as AuthTokenPayload;
  } catch {
    return null;
  }
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token: unknown = req.cookies?.token;

    if (typeof token !== 'string') {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
