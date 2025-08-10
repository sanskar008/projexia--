
import mongoose, { Schema, Document } from 'mongoose';
import { CommentDocument } from './Comment';

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "completed";

export interface TaskDocument extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assigneeId: string | null;
  creatorId: string;
  attachments: string[];
  comments: CommentDocument['_id'][];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  projectId: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["backlog", "todo", "in-progress", "review", "completed"],
    default: "backlog" 
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "urgent"],
    default: "medium" 
  },
  dueDate: { type: Date, required: true },
  assigneeId: { type: String, default: null },
  creatorId: { type: String, required: true },
  attachments: [{ type: String }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  tags: [{ type: String }],
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<TaskDocument>('Task', TaskSchema);
