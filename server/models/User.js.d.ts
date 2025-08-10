declare module "models/User.js" {
  import { Model, Document } from "mongoose";
  const User: Model<Document>;
  export default User;
}
