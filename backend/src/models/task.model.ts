import mongoose, { Schema, Document } from "mongoose";

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export enum Status {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    TO_DO = 'to_do',
    REVIEW = 'review'
}

export interface ITask extends Document {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    status: Status;
    createdById: string;
    assignedToId: string;
    collaborators: string[];
    lastModifiedBy?: string;
}

const taskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: Object.values(Priority),
        default: Priority.MEDIUM
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.TO_DO
    },
    createdById: {
        type: String,
        ref: 'User',
        required: [true, 'Creator user ID is required']
    },
    assignedToId: {
        type: String,
        ref: 'User',
        required: [true, 'Assignee user ID is required']
    },
    collaborators: {
        type: [String],
        ref: 'User',
        default: []
    },
    lastModifiedBy: {
        type: String,
        ref: 'User'
    },
}, { timestamps: true });

const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;

