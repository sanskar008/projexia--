import mongoose, { Schema, Document } from 'mongoose';

export interface ChatMessageDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ChatMessageDocument>('ChatMessage', ChatMessageSchema); 