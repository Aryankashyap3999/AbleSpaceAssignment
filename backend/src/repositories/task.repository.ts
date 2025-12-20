import { Types } from "mongoose";
import Task, { ITask } from "../models/task.model";
import { BaseRepository, ICrudRepository } from "./crud.repository";

export interface ITaskRepository extends ICrudRepository<ITask> {
  getTasksByUser(userId: string): Promise<ITask[]>;
  getTasksByAssignee(userId: string): Promise<ITask[]>;
  addCollaborator(taskId: string, userId: string): Promise<ITask | null>;
  removeCollaborator(taskId: string, userId: string): Promise<ITask | null>;
  updateTaskStatus(taskId: string, status: string): Promise<ITask | null>;
}

/**
 * Task Repository Implementation
 * Provides MongoDB data access for task management operations.
 * Extends BaseRepository for standard CRUD operations and implements
 * task-specific queries and bulk operations.
 * 
 * Database Operations:
 * - Basic CRUD: create, read, update, delete
 * - Queries: getTasksByUser, getTasksByAssignee
 * - Bulk Updates: addCollaborator, removeCollaborator, updateTaskStatus
 * 
 * @class TaskRepository
 * @extends {BaseRepository<ITask>}
 * @implements {ITaskRepository}
 */
export class TaskRepository extends BaseRepository<ITask> implements ITaskRepository {
  /**
   * Creates a new TaskRepository instance.
   * Initializes base repository with Task mongoose model.
   */
  constructor() {
    super(Task);
  }

  /**
   * Finds all tasks created by a specific user.
   * Used for "My Tasks" / "Created by Me" view.
   * 
   * @async
   * @param {string} userId - The creator's MongoDB user ID
   * @returns {Promise<ITask[]>} Array of task documents, empty array if none found
   * 
   * @example
   * const myTasks = await taskRepository.getTasksByUser('userId123');
   */
  async getTasksByUser(userId: string): Promise<ITask[]> {
    
    return await Task.find({ createdById: userId });
  }

  /**
   * Finds all tasks assigned to a specific user.
   * Used for "Assigned to Me" view.
   * 
   * @async
   * @param {string} userId - The assignee's MongoDB user ID
   * @returns {Promise<ITask[]>} Array of task documents, empty array if none found
   * 
   * @example
   * const assignedTasks = await taskRepository.getTasksByAssignee('userId123');
   */
  async getTasksByAssignee(userId: string): Promise<ITask[]> {
    console.log('Fetching tasks for assignee:', userId);
    return await Task.find({ assignedToId: userId });
  }

  /**
   * Adds a user to the collaborators array of a task.
   * Uses MongoDB $addToSet operator to prevent duplicate entries.
   * Automatically updates lastModifiedBy field with the user being added.
   * 
   * @async
   * @param {string} taskId - The task's MongoDB ObjectId
   * @param {string} userId - The user ID to add as collaborator
   * @returns {Promise<ITask | null>} The updated task document with new collaborator, or null if task not found
   * 
   * @example
   * const updated = await taskRepository.addCollaborator('taskId123', 'userId456');
   */
  async addCollaborator(taskId: string, userId: string): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      {
        $addToSet: { collaborators: new Types.ObjectId(userId) },
        lastModifiedBy: new Types.ObjectId(userId),
      },
      { new: true }
    );
  }

  /**
   * Removes a user from the collaborators array of a task.
   * Uses MongoDB $pull operator to safely remove the element.
   * Automatically updates lastModifiedBy field with the user being removed.
   * 
   * @async
   * @param {string} taskId - The task's MongoDB ObjectId
   * @param {string} userId - The user ID to remove from collaborators
   * @returns {Promise<ITask | null>} The updated task document with collaborator removed, or null if task not found
   * 
   * @example
   * const updated = await taskRepository.removeCollaborator('taskId123', 'userId456');
   */
  async removeCollaborator(taskId: string, userId: string): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: { collaborators: new Types.ObjectId(userId) },
        lastModifiedBy: new Types.ObjectId(userId),
      },
      { new: true }
    );
  }

  /**
   * Updates a task's status with modification tracking.
   * Automatically records who made the status change.
   * 
   * @async
   * @param {string} taskId - The task's MongoDB ObjectId
   * @param {string} status - The new status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
   * @param {string} modifiedBy - The user ID of the person making the change
   * @returns {Promise<ITask | null>} The updated task document with new status, or null if task not found
   * 
   * @example
   * const updated = await taskRepository.updateTaskStatus('taskId123', 'COMPLETED', 'userId456');
   */
  async updateTaskStatus(taskId: string, status: string): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        lastModifiedBy: new Types.ObjectId(status),
      },
      { new: true }
    );
  }
}

export default new TaskRepository();
