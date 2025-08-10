declare module "User" {
  import { Model, Document } from "mongoose";
  const User: Model<Document>;
  export default User;
}
