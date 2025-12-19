import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const ProblemController = {
    async signUpUser(req: Request, res: Response) {
        const user = await userService.signUpUserService(req.body);
        res.status(201).json({
            message: 'User registered successfully',
            data: user,
            success: true
        });
    },

    async signInUser(req: Request, res: Response) {
        const user = await userService.signInUserService(req.body);
        console.log("email is", req.body.email);
        res.status(200).json({
            message: 'User signed in successfully',
            data: user,
            success: true
        });
    }

}