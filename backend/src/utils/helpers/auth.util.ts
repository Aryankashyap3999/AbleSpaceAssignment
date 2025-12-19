import jwt from 'jsonwebtoken';
import { serverConfig } from '../../config';


const { JWT_SECRET, JWT_EXPIRY } = serverConfig;

export interface JwtPayload {
  id: string;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRY
  } as jwt.SignOptions);
}


