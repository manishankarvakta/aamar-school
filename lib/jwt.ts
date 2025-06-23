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

export function signToken(payload: Omit<DecodedToken, 'iat' | 'exp'>): string {
  // @ts-expect-error - JWT secret is validated at runtime
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  });
}

export function verifyToken(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    // @ts-expect-error - JWT secret is validated at runtime
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as DecodedToken);
    });
  });
}
