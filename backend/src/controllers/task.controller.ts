import { Response } from "express";
import { TaskService } from "../services/task.service";
import { TaskRepository } from "../repositories/task.repository";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);

export const TaskController = {
  async createTask(req: AuthenticatedRequest, res: Response) {
    const task = await taskService.createTask(
      req.body,
      req.user as string
    );

    res.status(201).json({
      message: 'Task created successfully',
      data: task,
      success: true
    });
  },

  async getTask(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;

    const task = await taskService.getTaskById(taskId);

    res.status(200).json({
      message: 'Task retrieved successfully',
      data: task,
      success: true
    });
  },

  async updateTask(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await taskService.updateTask(taskId, updates, req.user as string);

    res.status(200).json({
      message: 'Task updated successfully',
      data: task,
      success: true
    });
  },

  async deleteTask(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;

    await taskService.deleteTask(taskId);

    res.status(200).json({
      message: 'Task deleted successfully',
      success: true
    });
  },

  async getUserTasks(req: AuthenticatedRequest, res: Response) {
    console.log('User ID from request:', req.user);
    const tasks = await taskService.getUserTasks(req.user as string);

    res.status(200).json({
      message: 'Tasks retrieved successfully',
      data: tasks,
      success: true
    });
  },

  async getAssignedTasks(req: AuthenticatedRequest, res: Response) {
    const tasks = await taskService.getAssignedTasks(req.user as string);

    res.status(200).json({
      message: 'Assigned tasks retrieved successfully',
      data: tasks,
      success: true
    });
  },

  async addCollaborator(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await taskService.addCollaborator(taskId, userId, req.user as string);

    res.status(200).json({
      message: 'Collaborator added successfully',
      data: task,
      success: true
    });
  },

  async removeCollaborator(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;
    const { userId } = req.body;

    const task = await taskService.removeCollaborator(taskId, userId, req.user as string);

    res.status(200).json({
      message: 'Collaborator removed successfully',
      data: task,
      success: true
    });
  },

  async updateTaskStatus(req: AuthenticatedRequest, res: Response) {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await taskService.updateTaskStatus(taskId, status, req.user as string);

    res.status(200).json({
      message: 'Task status updated successfully',
      data: task,
      success: true
    });
  }
};
