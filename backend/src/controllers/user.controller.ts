import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const ProblemController = {
    async signUpUser(req: Request, res: Response) {
        const user = await userService.signUpUserService(req.body);
        
        // Set token as HttpOnly cookie
        res.cookie('token', user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Return user data and token in body (for cross-domain support)
        res.status(201).json({
            message: 'User registered successfully',
            data: {
                _id: user._id,
                email: user.email,
                name: user.name,
                username: user.username
            },
            token: user.token,
            success: true
        });
    },

    async signInUser(req: Request, res: Response) {
        const user = await userService.signInUserService(req.body);
        
        // Set token as HttpOnly cookie
        res.cookie('token', user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Return user data and token in body (for cross-domain support)
        res.status(200).json({
            message: 'User signed in successfully',
            data: {
                _id: user._id,
                email: user.email,
                name: user.name,
                username: user.username
            },
            token: user.token,
            success: true
        });
    },

    async searchUsers(req: Request, res: Response) {
        const query = req.query.q as string;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                data: [],
                message: 'Search query is required'
            });
        }

        const users = await userRepository.searchUsers(query.trim());
        
        res.status(200).json({
            success: true,
            data: users.map(user => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar || undefined
            })),
            message: 'Users found'
        });
    },

    async getUserById(req: Request, res: Response) {
        const { userId } = req.params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestError('Invalid user ID');
        }

        const user = await userRepository.findUserById(new mongoose.Types.ObjectId(userId));
        
        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar || undefined
            },
            message: 'User found'
        });
    },

    async logout(req: Request, res: Response) {
        // Clear the HttpOnly cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    },

    async getProfile(req: AuthenticatedRequest, res: Response) {
        const userId = req.user;

        if (!userId) {
            throw new BadRequestError('User not authenticated');
        }

        const user = await userRepository.findUserById(new mongoose.Types.ObjectId(userId));

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar || undefined
            },
            message: 'Profile retrieved successfully'
        });
    },

    async updateProfile(req: AuthenticatedRequest, res: Response) {
        const userId = req.user;
        const { name, avatar } = req.body;

        if (!userId) {
            throw new BadRequestError('User not authenticated');
        }

        if (!name) {
            throw new BadRequestError('Name is required');
        }

        const updatedUser = await userRepository.updateUserProfile(
            new mongoose.Types.ObjectId(userId),
            { name, avatar }
        );

        if (!updatedUser) {
            throw new NotFoundError('User not found');
        }

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                avatar: updatedUser.avatar || undefined
            },
            message: 'Profile updated successfully'
        });
    }

}