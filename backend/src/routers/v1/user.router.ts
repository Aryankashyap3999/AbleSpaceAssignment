import express from 'express';
import { ProblemController } from '../../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/signup', ProblemController.signUpUser)
userRouter.post('/signin', ProblemController.signInUser)

export default userRouter;