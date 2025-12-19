import { Types } from "mongoose";
import Task, { ITask } from "../models/task.model";
import { BaseRepository, ICrudRepository } from "./crud.repository";

export interface ITaskRepository extends ICrudRepository<ITask> {
  getTasksByUser(userId: string): Promise<ITask[]>;
  getTasksByAssignee(userId: string): Promise<ITask[]>;
  addCollaborator(taskId: string, userId: string): Promise<ITask | null>;
  removeCollaborator(taskId: string, userId: string): Promise<ITask | null>;
  updateTaskStatus(taskId: string, status: string, modifiedBy: string): Promise<ITask | null>;
}

export class TaskRepository extends BaseRepository<ITask> implements ITaskRepository {
  constructor() {
    super(Task);
  }

  async getTasksByUser(userId: string): Promise<ITask[]> {
    
    return await Task.find({ createdById: userId });
  }

  async getTasksByAssignee(userId: string): Promise<ITask[]> {
    console.log('Fetching tasks for assignee:', userId);
    return await Task.find({ assignedToId: userId });
  }

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

  async updateTaskStatus(taskId: string, status: string, modifiedBy: string): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        lastModifiedBy: new Types.ObjectId(modifiedBy),
      },
      { new: true }
    );
  }
}

export default new TaskRepository();
