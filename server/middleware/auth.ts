/**
 * Auth Middleware — JWT verification + role-based access + password hashing
 *
 * Uses Node.js native crypto.scrypt for password hashing (zero dependencies).
 *
 * Usage:
 *   - Public routes: no middleware
 *   - Authenticated routes: requireAuth()
 *   - Role-restricted routes: requireAuth('candidate') or requireAuth('recruiter')
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('⚠️  CRITICAL: JWT_SECRET is missing or too short (min 32 chars). Set it in .env!');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}
const SECRET = JWT_SECRET || crypto.randomBytes(32).toString('hex');

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role: string };
  }
}

/**
 * Hash a password using scrypt (Node.js native, no bcrypt needed).
 * Returns format: salt:hash (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey);
}

/**
 * Generate a JWT for a user. Call this after successful login/registration.
 * Expiry: 7 days (refresh via re-login).
 */
export function generateToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, SECRET, { expiresIn: '7d' });
}

/**
 * Middleware: verify JWT in Authorization header.
 * Optionally require a specific role.
 */
export function requireAuth(role?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Autenticação necessária. Envie o token no header Authorization.',
        code: 'AUTH_TOKEN_REQUIRED',
      });
    }

    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, SECRET) as { sub: string; role: string };
      req.user = { id: payload.sub, role: payload.role };

      const adminBypass = role && req.user.role === 'admin';
      if (role && req.user.role !== role && !adminBypass) {
        return res.status(403).json({
          error: 'Acesso negado. Permissão insuficiente.',
          code: 'AUTH_ROLE_FORBIDDEN',
        });
      }

      next();
    } catch {
      return res
        .status(401)
        .json({ error: 'Token inválido ou expirado.', code: 'AUTH_TOKEN_INVALID' });
    }
  };
}
