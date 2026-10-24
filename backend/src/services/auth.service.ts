import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { RepositoryService } from './repository.service.js';
import { AuthTokenPayload, AuthResponse } from '../types/auth.js';
import { User } from '../types/models.js';

export class AuthService {
  private static instance: AuthService;
  private repo = RepositoryService.getInstance();

  private constructor() {
    this.ensureDefaultAdmin();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async ensureDefaultAdmin(): Promise<void> {
    const admin = await this.repo.getUserByEmail('admin@accessglobal.io');
    if (!admin) {
      const hash = await bcrypt.hash('AdminPass123!', 10);
      await this.repo.createUser({
        name: 'Super Admin',
        email: 'admin@accessglobal.io',
        role: 'admin',
        status: 'active',
        passwordHash: hash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
      });
    }
  }

  public generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });
  }

  public verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    } catch {
      return null;
    }
  }

  public async register(name: string, email: string, password: string, role: 'admin' | 'user' | 'manager' = 'user'): Promise<AuthResponse> {
    const existing = await this.repo.getUserByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.repo.createUser({
      name,
      email,
      passwordHash,
      role,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    const token = this.generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.repo.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        throw new Error('Invalid email or password.');
      }
    } else {
      // Default demo password check if legacy seed
      if (password !== 'admin' && password !== 'AdminPass123!') {
        throw new Error('Invalid email or password.');
      }
    }

    const token = this.generateToken(user);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}
