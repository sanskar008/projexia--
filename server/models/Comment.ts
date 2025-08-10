
import mongoose, { Schema, Document } from 'mongoose';

export interface CommentDocument extends Document {
  content: string;
  userId: string;
  taskId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<CommentDocument>('Comment', CommentSchema);
