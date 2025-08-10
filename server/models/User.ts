import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role?: "user" | "admin";
  googleId?: string;
  photo?: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  googleId: { type: String },
  photo: String,
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
