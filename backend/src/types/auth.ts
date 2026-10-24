import { User } from './models.js';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}
