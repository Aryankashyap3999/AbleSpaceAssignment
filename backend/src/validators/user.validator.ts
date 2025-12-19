import {z} from 'zod';

export const createUserSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(6).max(100)
});

export const signInUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type SignInUserInput = z.infer<typeof signInUserSchema>; 