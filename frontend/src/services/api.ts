import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
}

interface AuthResponse {
  user: AuthUser;
}

export interface LessonTutorQuestion {
  lessonId: string;
  currentTimestamp: number;
  question: string;
}

export interface LessonTutorAnswer {
  answer: string;
  citations?: Array<{ label: string; timestamp?: number }>;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const register = async (email: string, password: string, full_name: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', { email, password, full_name });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data;
};

export const askLessonTutor = async (question: LessonTutorQuestion): Promise<LessonTutorAnswer> => {
  const response = await api.post<LessonTutorAnswer>('/ai/tutor', question);
  return response.data;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: unknown }>(error)) {
    const message = error.response?.data?.error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

export default api;
