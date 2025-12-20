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

/**
 * Task Service Interface
 * Defines all business logic operations for task management.
 * 
 * @interface ITaskService
 */
export interface ITaskService {
  /**
   * Creates a new task with the provided input data.
   * @param {CreateTaskInput} data - Task creation data
   * @param {string} createdBy - User ID of the task creator
   * @returns {Promise<ITask>} The created task object
export interface ITaskService {
  createTask(data: CreateTaskInput, createdBy: string): Promise<ITask>;
   * @param {UpdateTaskInput} data - Partial update data
   * @param {string} modifiedBy - User ID who performed the modification
  getTaskById(taskId: string): Promise<ITask>;
   * Permanently deletes a task.
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {NotFoundError} If task doesn't exist
   */
  deleteTask(taskId: string): Promise<boolean>;
  getUserTasks(userId: string): Promise<ITask[]>;
  getAssignedTasks(userId: string): Promise<ITask[]>;
  addCollaborator(taskId: string, userId: string): Promise<ITask>;

  removeCollaborator(taskId: string, userId: string): Promise<ITask>;

  /**
   * Updates the status of a task.
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @param {Status} status - The new status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
   * @param {string} modifiedBy - User ID who changed the status
   * @returns {Promise<ITask>} The updated task object with new status
   * @throws {NotFoundError} If task doesn't exist
   */
  updateTaskStatus(taskId: string, status: Status): Promise<ITask>;
}

export class TaskService implements ITaskService {
  private taskRepository: ITaskRepository;

  constructor(taskRepository: ITaskRepository) {
    this.taskRepository = taskRepository;
  }

  /**
   * Creates a new task with validation and initialization.
   * 
   * @async
   * @param {CreateTaskInput} data - The task creation data
   * @param {string} createdBy - The user ID of the task creator
   * @returns {Promise<ITask>} The newly created task document
   * 
   * @throws {BadRequestError} If task creation fails in the repository
   * 
   * @example
   * const taskData: CreateTaskInput = {
   *   title: 'Implement user auth',
   *   description: 'Add JWT-based authentication',
   *   priority: Priority.HIGH,
   *   assignedToId: 'userId123',
   *   dueDate: '2025-12-31'
   * };
   * const newTask = await taskService.createTask(taskData, 'creatorId');
   */
  async createTask(data: CreateTaskInput, createdBy: string): Promise<ITask> {
    const newTask = await this.taskRepository.create({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status || Status.TODO,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdById: new Types.ObjectId(createdBy),
      assignedToId: data.assignedToId ? new Types.ObjectId(data.assignedToId) : undefined,
      lastModifiedBy: new Types.ObjectId(createdBy),
      collaborators: []
    } as any);

    if (!newTask) {
      throw new BadRequestError('Failed to create task');
    }

    return newTask;
  }

  /**
   * Retrieves a task by its ID with validation.
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task to retrieve
   * @returns {Promise<ITask>} The task document
   * @throws {NotFoundError} If the task with the specified ID doesn't exist
   */
  async getTaskById(taskId: string): Promise<ITask> {
    const task = await this.taskRepository.getById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  /**
   * Updates a task with partial data and tracks modification history.
   * Automatically converts string dates to Date objects and updates lastModifiedBy.
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @param {UpdateTaskInput} data - Partial task update data (all fields optional)
   * @param {string} modifiedBy - The user ID of the person making the modification
   * @returns {Promise<ITask>} The updated task document
   * @throws {NotFoundError} If task doesn't exist
   * @throws {BadRequestError} If the update operation fails
   */
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

  /**
   * Permanently deletes a task after validating it exists.
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task to delete
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {NotFoundError} If the task doesn't exist
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await this.taskRepository.delete(taskId);
    return true;
  }

  /**
   * Retrieves all tasks created by a specific user.
   * 
   * @async
   * @param {string} userId - The user ID of the task creator
   * @returns {Promise<ITask[]>} Array of all tasks created by this user
   */
  async getUserTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.getTasksByUser(userId);
  }

  /**
   * Retrieves all tasks assigned to a specific user.
   * 
   * @async
   * @param {string} userId - The user ID of the task assignee
   * @returns {Promise<ITask[]>} Array of all tasks assigned to this user
   */
  async getAssignedTasks(userId: string): Promise<ITask[]> {
    return await this.taskRepository.getTasksByAssignee(userId);
  }

  /**
   * Adds a user as a collaborator to a task.
   * Updates the lastModifiedBy field to track who made the change.
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @param {string} userId - The user ID to add as collaborator
   * @param {string} addedBy - The user ID of the person adding the collaborator (for audit trail)
   * @returns {Promise<ITask>} The updated task with new collaborator added
   * @throws {NotFoundError} If the task doesn't exist
   */
  async addCollaborator(taskId: string, userId: string): Promise<ITask> {
    const task = await this.taskRepository.addCollaborator(taskId, userId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  /**
   * Removes a collaborator from a task.
   * Updates the lastModifiedBy field to track who made the change.
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @param {string} userId - The user ID to remove from collaborators
   * @param {string} removedBy - The user ID of the person removing the collaborator (for audit trail)
   * @returns {Promise<ITask>} The updated task with collaborator removed
   * @throws {NotFoundError} If the task doesn't exist
   */
  async removeCollaborator(taskId: string, userId: string): Promise<ITask> {
    const task = await this.taskRepository.removeCollaborator(taskId, userId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  /**
   * Updates the status of a task with audit trail.
   * Valid statuses: TODO, IN_PROGRESS, COMPLETED, CANCELLED
   * 
   * @async
   * @param {string} taskId - The MongoDB ObjectId of the task
   * @param {Status} status - The new status value
   * @param {string} modifiedBy - The user ID who changed the status
   * @returns {Promise<ITask>} The updated task with new status
   * @throws {NotFoundError} If the task doesn't exist
   */
  async updateTaskStatus(taskId: string, status: Status): Promise<ITask> {
    const task = await this.taskRepository.updateTaskStatus(taskId, status);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }
}
