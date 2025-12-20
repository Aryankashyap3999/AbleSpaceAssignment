import express from 'express';
import { ProblemController } from '../../controllers/user.controller';
import { validateRequestBody } from '../../validators';
import { createUserSchema, signInUserSchema } from '../../validators/user.validator';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/helpers/asyncHandler';

const userRouter = express.Router();

userRouter.post('/signup', validateRequestBody(createUserSchema), asyncHandler(ProblemController.signUpUser));
userRouter.post('/signin', validateRequestBody(signInUserSchema), asyncHandler(ProblemController.signInUser));

// Protected routes
userRouter.post('/logout', isAuthenticated, asyncHandler(ProblemController.logout));
userRouter.get('/profile', isAuthenticated, asyncHandler(ProblemController.getProfile));
userRouter.put('/profile', isAuthenticated, asyncHandler(ProblemController.updateProfile));
userRouter.get('/search', isAuthenticated, asyncHandler(ProblemController.searchUsers));
userRouter.get('/:userId', isAuthenticated, asyncHandler(ProblemController.getUserById));

export default userRouter;