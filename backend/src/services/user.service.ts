import { IUser } from "../models/user.model";
import { BadRequestError } from "../utils/errors/app.error";
import { IUserRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/helpers/auth.util";

export interface SignUpResponse {
    _id: any;
    email: string;
    name: string;
    username: string;
    token: string;
}

export interface SignInResponse {
    _id: any;
    name: string;
    username: string;
    avatar: string;
    email: string;
    token: string;
}

export interface IUserService {
    signUpUserService(data: Partial<IUser>): Promise<SignUpResponse>;
    signInUserService(data: { email: string; password: string }): Promise<SignInResponse>;
}

export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async signUpUserService(data: Partial<IUser>): Promise<SignUpResponse> {
        const newUser: IUser = await this.userRepository.signUpUser(data as Omit<IUser, keyof Document>);
        return {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            username: newUser.username,
            token: generateToken({ id: newUser._id.toString(), email: newUser.email })
        };
    }

    async signInUserService({ email, password }: { email: string; password: string }): Promise<SignInResponse> {
        const user: IUser | null = await this.userRepository.getByEmail(email);
        if(!user) {
            throw new BadRequestError('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            throw new BadRequestError('Invalid email or password');
        }

        return {
            _id: user._id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            email: user.email,
            token: generateToken({ id: user._id.toString(), email: user.email })
        };
    }

}