import express from 'express';
import pingRouter from './ping.router';
import userRouter from './user.router';
import taskRouter from './task.router';

const v1Router = express.Router();


v1Router.use('/users', userRouter)
v1Router.use('/tasks', taskRouter)
v1Router.use('/ping',  pingRouter);

export default v1Router;