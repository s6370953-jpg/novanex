import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { User, CreateUserInput, LoginInput } from '../models/User';

const SALT_ROUNDS = 10;

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const email = input.email.trim().toLowerCase();
  const { password, full_name } = input;

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *',
    [email, password_hash, full_name.trim()]
  );

  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const validatePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const verifyCredentials = async (input: LoginInput): Promise<User | null> => {
  const { email, password } = input;
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await validatePassword(password, user.password_hash);
  return isValid ? user : null;
};
