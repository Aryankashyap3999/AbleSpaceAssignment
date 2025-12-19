import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { serverConfig } from '../config';
import userRepository from '../repositories/user.repository';
import { UnauthorizedError, ForbiddenError } from '../utils/errors/app.error';
import logger from '../config/logger.config';

export interface AuthenticatedRequest extends Request {
  user?: string;
}

export interface DecodedToken {
  id: string;
  email: string;
}

export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers['x-access-token'] as string;

    if (!token) {
      throw new ForbiddenError('No auth token provided');
    }

    const decoded = jwt.verify(token, serverConfig.JWT_SECRET as string) as DecodedToken;

    if (!decoded || !decoded.id) {
      throw new ForbiddenError('Invalid auth token provided');
    }

    const user = await userRepository.getById(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user._id?.toString();
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      const forbiddenError = new ForbiddenError('Invalid or expired auth token');
      res.status(forbiddenError.statusCode).json({
        message: forbiddenError.message,
        success: false
      });
      return;
    }

    if (error instanceof ForbiddenError) {
      res.status(error.statusCode).json({
        message: error.message,
        success: false
      });
      return;
    }

    if (error instanceof UnauthorizedError) {
      res.status(error.statusCode).json({
        message: error.message,
        success: false
      });
      return;
    }

    res.status(500).json({
      message: 'Internal Server Error',
      success: false
    });
  }
};
