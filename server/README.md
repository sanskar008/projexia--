
# Project Management Application

This is a full-stack project management application with React frontend and MongoDB backend.

## Frontend

The frontend is built with React, Tailwind CSS, and shadcn/ui components.

### Features
- Dashboard with project statistics
- Kanban board for task management
- Team management
- Calendar view for deadlines

## Backend

The backend is built with Express.js and MongoDB.

### Setup

1. Make sure you have MongoDB installed and running locally.
   - You can download MongoDB from [here](https://www.mongodb.com/try/download/community).
   - Alternatively, you can use MongoDB Atlas (cloud version) and update the connection string in `.env`.

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

## Running the Full Application

1. Start MongoDB:
   ```
   mongod
   ```

2. Start the backend server (in one terminal):
   ```
   cd server
   npm run dev
   ```

3. Start the frontend (in another terminal):
   ```
   npm run dev
   ```

## Environment Variables

You can configure the application by creating a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-manager
```
