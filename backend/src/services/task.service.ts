import { Types } from "mongoose";
import { ITask, Priority, Status } from "../models/task.model";
import { ITaskRepository } from "../repositories/task.repository";
import { BadRequestError, NotFoundError } from "../utils/errors/app.error";

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: Priority;
  status?: Status;
  dueDate?: string;
  assignedToId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  assignedToId?: string;
}

export interface ITaskService {
  createTask(data: CreateTaskInput, createdBy: string): Promise<ITask>;
  getTaskById(taskId: string): Promise<ITask>;
  updateTask(taskId: string, data: UpdateTaskInput, modifiedBy: string): Promise<ITask>;
  deleteTask(taskId: string): Promise<boolean>;
  getUserTasks(userId: string): Promise<ITask[]>;
  getAssignedTasks(userId: string): Promise<ITask[]>;
  addCollaborator(taskId: string, userId: string, addedBy: string): Promise<ITask>;
  removeCollaborator(taskId: string, userId: string, removedBy: string): Promise<ITask>;
  updateTaskStatus(taskId: string, status: Status, modifiedBy: string): Promise<ITask>;
}

export class TaskService implements ITaskService {
  private taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository;
  }

  async createTask(data: CreateTaskInput, createdBy: string): Promise<ITask> {
    const newTask = await this.taskRepository.create({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status || Status.TO_DO,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdById: new Types.ObjectId(createdBy),
      assignedToId: new Types.ObjectId(data.assignedToId),
      lastModifiedBy: new Types.ObjectId(createdBy),
      collaborators: []
    } as any);

    if (!newTask) {
      throw new BadRequestError('Failed to create task');
    }

    return newTask;
  }

  async getTaskById(taskId: string): Promise<ITask> {
    const task = await this.taskRepository.getById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async updateTask(taskId: string, data: UpdateTaskInput, modifiedBy: string): Promise<ITask> {
    const existingTask = await this.taskRepository.getById(taskId);

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    const modifiedByObj = new Types.ObjectId(modifiedBy);
    const updateData: any = {
      ...data,
      lastModifiedBy: modifiedByObj,
    };

    // Convert dueDate to Date if provided
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const updatedTask = await this.taskRepository.update(taskId, updateData);

    if (!updatedTask) {
      throw new BadRequestError('Failed to update task');
    }

    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await this.taskRepository.delete(taskId);
    return true;
  }

  async getUserTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.getTasksByUser(userId);
  }

  async getAssignedTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.getTasksByAssignee(userId);
  }

  async addCollaborator(taskId: string, userId: string, addedBy: string): Promise<ITask> {
    const task = await this.taskRepository.addCollaborator(taskId, userId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async removeCollaborator(taskId: string, userId: string, removedBy: string): Promise<ITask> {
    const task = await this.taskRepository.removeCollaborator(taskId, userId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async updateTaskStatus(taskId: string, status: Status, modifiedBy: string): Promise<ITask> {
    const task = await this.taskRepository.updateTaskStatus(taskId, status, modifiedBy);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }
}
