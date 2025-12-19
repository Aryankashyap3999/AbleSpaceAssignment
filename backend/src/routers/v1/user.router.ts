import express from 'express';
import { ProblemController } from '../../controllers/user.controller';
import { validateRequestBody } from '../../validators';
import { createUserSchema, signInUserSchema } from '../../validators/user.validator';

const userRouter = express.Router();

userRouter.post('/signup', validateRequestBody(createUserSchema), ProblemController.signUpUser);
userRouter.post('/signin', validateRequestBody(signInUserSchema), ProblemController.signInUser);

export default userRouter;