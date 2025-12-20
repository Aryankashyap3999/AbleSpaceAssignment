/**
 * @file task.service.test.ts
 * @description Unit tests for TaskService business logic
 * Tests cover critical functionality: task creation, validation, updates, and error handling
 */

import { TaskService, CreateTaskInput, UpdateTaskInput } from '../services/task.service';
import { ITaskRepository } from '../repositories/task.repository';
import { Priority, Status } from '../models/task.model';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';
import { Types } from 'mongoose';

/**
 * Mock TaskRepository for unit testing
 * Simulates database operations without requiring a real MongoDB connection
 */
class MockTaskRepository implements ITaskRepository {
  private tasks: any[] = [];

  async create(data: any) {
    const task = {
      ...data,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async getById(id: string | Types.ObjectId) {
    const idStr = typeof id === 'string' ? id : id.toString();
    return this.tasks.find(t => t._id.toString() === idStr) || null;
  }

  async getAll() {
    return this.tasks;
  }

  async update(id: string | Types.ObjectId, data: any) {
    const idStr = typeof id === 'string' ? id : id.toString();
    const task = await this.getById(idStr);
    if (!task) return null;
    Object.assign(task, data, { updatedAt: new Date() });
    return task;
  }

  async delete(id: string | Types.ObjectId) {
    const idStr = typeof id === 'string' ? id : id.toString();
    const index = this.tasks.findIndex(t => t._id.toString() === idStr);
    if (index > -1) {
      const deleted = this.tasks.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  async deleteMany(ids: (string | Types.ObjectId)[]) {
    const idStrs = ids.map(id => typeof id === 'string' ? id : id.toString());
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => !idStrs.includes(t._id.toString()));
    return { deletedCount: initialLength - this.tasks.length };
  }

  async getTasksByUser(userId: string) {
    return this.tasks.filter(t => t.createdById.toString() === userId);
  }

  async getTasksByAssignee(userId: string) {
    return this.tasks.filter(t => t.assignedToId?.toString() === userId);
  }

  async addCollaborator(taskId: string, userId: string) {
    const task = await this.getById(taskId);
    if (!task) return null;
    if (!task.collaborators.some((c: any) => c.toString() === userId)) {
      task.collaborators.push(new Types.ObjectId(userId));
    }
    task.updatedAt = new Date();
    return task;
  }

  async removeCollaborator(taskId: string, userId: string) {
    const task = await this.getById(taskId);
    if (!task) return null;
    task.collaborators = task.collaborators.filter((c: any) => c.toString() !== userId);
    task.updatedAt = new Date();
    return task;
  }

  async updateTaskStatus(taskId: string, status: string) {
    const task = await this.getById(taskId);
    if (!task) return null;
    task.status = status;
    task.updatedAt = new Date();
    return task;
  }
}

describe('TaskService - Task Creation', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;
  const userId = new Types.ObjectId().toString();
  const assigneeId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  it('TEST 1: Should create a task with valid input', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Implement authentication',
      description: 'Add JWT-based authentication system',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
      dueDate: '2025-12-31',
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    expect(createdTask).toBeDefined();
    expect(createdTask.title).toBe(taskInput.title);
    expect(createdTask.description).toBe(taskInput.description);
    expect(createdTask.priority).toBe(Priority.HIGH);
    expect(createdTask.status).toBe(Status.TODO);
    expect(createdTask.createdById.toString()).toBe(userId);
    expect(createdTask.assignedToId?.toString()).toBe(assigneeId);
    expect(createdTask.collaborators).toEqual([]);
    expect(createdTask.dueDate).toBeInstanceOf(Date);
  });

  it('TEST 2: Should create a task with custom status', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Design system',
      description: 'Create design system components',
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    expect(createdTask.status).toBe(Status.IN_PROGRESS);
    expect(createdTask.title).toBe('Design system');
  });

  it('TEST 3: Should throw BadRequestError on repository failure', async () => {
    const mockRepoWithFailure: any = {
      create: jest.fn().mockResolvedValue(null),
      getById: jest.fn().mockResolvedValue(null),
    };
    const serviceWithBadRepo = new TaskService(mockRepoWithFailure);

    const taskInput: CreateTaskInput = {
      title: 'Test',
      description: 'Test task',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
    };

    try {
      await serviceWithBadRepo.createTask(taskInput, userId);
      fail('Should have thrown BadRequestError');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as any).message).toBe('Failed to create task');
    }
  });
});

describe('TaskService - Task Updates', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;
  const userId = new Types.ObjectId().toString();
  const assigneeId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  it('TEST 4: Should update a task with partial data', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Original title',
      description: 'Original description',
      priority: Priority.LOW,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    const updateData: UpdateTaskInput = {
      title: 'Updated title',
      priority: Priority.HIGH,
    };

    const modifierId = new Types.ObjectId().toString();
    const updatedTask = await taskService.updateTask(
      createdTask._id.toString(),
      updateData,
      modifierId
    );

    expect(updatedTask.title).toBe('Updated title');
    expect(updatedTask.priority).toBe(Priority.HIGH);
    expect(updatedTask.description).toBe('Original description');
    expect(updatedTask.assignedToId?.toString()).toBe(assigneeId);
    expect(updatedTask.lastModifiedBy?.toString()).toBe(modifierId);
  });

  it('TEST 5: Should update task due date correctly', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Task with deadline',
      description: 'Description',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
      dueDate: '2025-12-31',
    };

    const createdTask = await taskService.createTask(taskInput, userId);
    const newDueDate = '2026-06-30';

    const updatedTask = await taskService.updateTask(
      createdTask._id.toString(),
      { dueDate: newDueDate },
      userId
    );

    expect(updatedTask.dueDate).toBeInstanceOf(Date);
    expect(updatedTask.dueDate.toISOString().split('T')[0]).toBe(newDueDate);
  });

  it('TEST 6: Should throw NotFoundError when task does not exist', async () => {
    const fakeTaskId = new Types.ObjectId().toString();
    const updateData: UpdateTaskInput = { title: 'New title' };

    try {
      await taskService.updateTask(fakeTaskId, updateData, userId);
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as any).message).toBe('Task not found');
    }
  });
});

describe('TaskService - Collaboration Features', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;
  const userId = new Types.ObjectId().toString();
  const assigneeId = new Types.ObjectId().toString();
  const collaboratorId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  it('TEST 7: Should add a collaborator to a task', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Team project',
      description: 'Collaborative task',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);
    const taskWithCollaborator = await taskService.addCollaborator(
      createdTask._id.toString(),
      collaboratorId
    );

    expect(taskWithCollaborator.collaborators).toHaveLength(1);
    expect(taskWithCollaborator.collaborators[0].toString()).toBe(collaboratorId);
    expect(taskWithCollaborator.title).toBe('Team project');
  });

  it('TEST 8: Should remove a collaborator from a task', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Team project',
      description: 'Collaborative task',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    const collaborator1 = new Types.ObjectId().toString();
    const collaborator2 = new Types.ObjectId().toString();

    await taskService.addCollaborator(createdTask._id.toString(), collaborator1);
    await taskService.addCollaborator(createdTask._id.toString(), collaborator2);

    const taskAfterRemoval = await taskService.removeCollaborator(
      createdTask._id.toString(),
      collaborator1
    );

    expect(taskAfterRemoval.collaborators).toHaveLength(1);
    expect(taskAfterRemoval.collaborators[0].toString()).toBe(collaborator2);
  });

  it('TEST 9: Should throw error when adding collaborator to non-existent task', async () => {
    const fakeTaskId = new Types.ObjectId().toString();

    try {
      await taskService.addCollaborator(fakeTaskId, collaboratorId);
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as any).message).toBe('Task not found');
    }
  });
});

describe('TaskService - Status Management', () => {
  let taskService: TaskService;
  let mockRepository: MockTaskRepository;
  const userId = new Types.ObjectId().toString();
  const assigneeId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRepository = new MockTaskRepository();
    taskService = new TaskService(mockRepository);
  });

  it('TEST 10: Should update task status', async () => {
    const taskInput: CreateTaskInput = {
      title: 'In progress task',
      description: 'Task being worked on',
      priority: Priority.HIGH,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    const updatedTask = await taskService.updateTaskStatus(
      createdTask._id.toString(),
      Status.IN_PROGRESS
    );

    expect(updatedTask.status).toBe(Status.IN_PROGRESS);
    expect(updatedTask.title).toBe('In progress task');
    expect(updatedTask.lastModifiedBy?.toString()).toBe(userId);
  });

  it('TEST 11: Should mark task as completed', async () => {
    const taskInput: CreateTaskInput = {
      title: 'Implement feature',
      description: 'Add new feature',
      priority: Priority.MEDIUM,
      assignedToId: assigneeId,
    };

    const createdTask = await taskService.createTask(taskInput, userId);

    const completedTask = await taskService.updateTaskStatus(
      createdTask._id.toString(),
      Status.COMPLETED
    );

    expect(completedTask.status).toBe(Status.COMPLETED);
  });

  it('TEST 12: Should throw error when updating status of non-existent task', async () => {
    const fakeTaskId = new Types.ObjectId().toString();

    try {
      await taskService.updateTaskStatus(fakeTaskId, Status.COMPLETED);
      fail('Should have thrown NotFoundError');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as any).message).toBe('Task not found');
    }
  });
});
