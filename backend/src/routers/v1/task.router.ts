import express from 'express';
import { TaskController } from '../../controllers/task.controller';
import { validateRequestBody } from '../../validators';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { addCollaboratorSchema, createTaskSchema, updateStatusSchema, updateTaskSchema } from '../../validators/task.validator';

const taskRouter = express.Router();

taskRouter.post('/create', isAuthenticated, validateRequestBody(createTaskSchema), TaskController.createTask);
taskRouter.get('/user', isAuthenticated, TaskController.getUserTasks);
taskRouter.get('/assigned', isAuthenticated, TaskController.getAssignedTasks);

taskRouter.get('/:taskId', isAuthenticated, TaskController.getTask);
taskRouter.put('/:taskId', isAuthenticated, validateRequestBody(updateTaskSchema), TaskController.updateTask);
taskRouter.delete('/:taskId', isAuthenticated, TaskController.deleteTask);
taskRouter.post('/:taskId/collaborators/add', isAuthenticated, validateRequestBody(addCollaboratorSchema), TaskController.addCollaborator);
taskRouter.post('/:taskId/collaborators/remove', isAuthenticated, validateRequestBody(addCollaboratorSchema), TaskController.removeCollaborator);
taskRouter.patch('/:taskId/status', isAuthenticated, validateRequestBody(updateStatusSchema), TaskController.updateTaskStatus);

export default taskRouter;
