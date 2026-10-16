export interface User {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'student' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type UserRole = User['role'];

export type SafeUser = Pick<User, 'id' | 'email' | 'full_name' | 'role'>;
