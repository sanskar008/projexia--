
import mongoose, { Schema, Document } from 'mongoose';

export interface ProjectMemberDocument extends Document {
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarUrl: string;
  projectId: mongoose.Types.ObjectId;
}

const ProjectMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "member", "viewer"],
    default: "member" 
  },
  avatarUrl: { type: String },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
});

export default mongoose.model<ProjectMemberDocument>('ProjectMember', ProjectMemberSchema);
