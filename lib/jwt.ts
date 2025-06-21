import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

export interface DecodedToken {
  userId: string;
  role: UserRole;
  schoolId: string;
  branchId: string | null;
  iat: number;
  exp: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined');
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

export function signToken(payload: Omit<DecodedToken, 'iat' | 'exp'>): string {
  // @ts-ignore
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  });
}

export function verifyToken(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as DecodedToken);
    });
  });
}
