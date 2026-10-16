import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createUser, findUserByEmail, findUserById, verifyCredentials } from '../services/user.service';
import { generateToken } from '../middleware/auth.middleware';
import { CreateUserInput, LoginInput, SafeUser, UserRole } from '../models/User';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
};

const safeUser = (user: { id: number; email: string; full_name: string; role: UserRole }): SafeUser => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
});

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error &&
  error.code === '23505';

const databaseErrorCode = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : 'unknown';

const validEmail = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validPassword = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length >= 8 &&
  Buffer.byteLength(value, 'utf8') <= 72;

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Please provide valid registration details' });
      return;
    }
    const { email, password, full_name } = body as Partial<CreateUserInput>;

    if (!validEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    if (!validPassword(password)) {
      res.status(400).json({ error: 'Password must be at least 8 characters and no more than 72 bytes' });
      return;
    }

    if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length > 100) {
      res.status(400).json({ error: 'Please enter a name of 1 to 100 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const user = await createUser({ email: normalizedEmail, password, full_name });

    const token = generateToken(user.id, user.email, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user: safeUser(user),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    console.error('Registration failed; database error code:', databaseErrorCode(error));
    res.status(500).json({ error: 'We could not create your account. Please try again.' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body: unknown = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Please provide valid login details' });
      return;
    }
    const { email, password } = body as Partial<LoginInput>;

    if (!validEmail(email) || !validPassword(password)) {
      res.status(400).json({ error: 'Please enter a valid email and password' });
      return;
    }

    const user = await verifyCredentials({ email, password });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.email, user.role);
    setAuthCookie(res, token);

    res.json({
      message: 'Login successful',
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Login failed');
    res.status(500).json({ error: 'We could not sign you in. Please try again.' });
  }
};

export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: 'Logout successful' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await findUserById(req.user.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('Fetching authenticated user failed');
    res.status(500).json({ error: 'We could not load your account. Please try again.' });
  }
};
