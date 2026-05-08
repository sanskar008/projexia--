# Projexia - Team Task Manager

Projexia is a comprehensive full-stack team task management application designed to help teams organize projects, track tasks, and collaborate effectively.

## Features

### Authentication and Security
- User Signup and Login functionality.
- Secure session management using JWT (JSON Web Tokens).
- Protected routes to ensure data privacy.

### Project and Team Management
- Create and manage multiple projects.
- Invite team members to projects via email.
- Assign roles (Admin, Member, Viewer) to control access and permissions.
- Dedicated team page to view member activity and task counts.

### Task Management
- Visual Kanban board for tracking task progress across different stages (Backlog, To Do, In Progress, Review, Completed).
- Drag-and-drop interface for seamless status updates.
- Task creation with detailed descriptions, priorities (Urgent, High, Medium, Low), due dates, and tags.
- Task assignment to specific team members.

### Dashboard and Analytics
- Real-time project statistics and progress tracking.
- Task distribution breakdown by status.
- Automated tracking of upcoming and overdue tasks.
- Recent activity feed to stay updated on project changes.

### Collaboration Tools
- Built-in group chat for real-time project discussion.
- Task comments for specific feedback and updates.
- Calendar view to visualize project deadlines and timelines.

## Technology Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for responsive styling
- shadcn/ui components
- Lucide React for iconography
- React Query for efficient data fetching

### Backend
- Node.js and Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- REST API architecture

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB account (local or MongoDB Atlas)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd projexia
   ```

2. Backend Setup:
   ```bash
   cd server
   npm install
   # Create a .env file in the server directory (see Environment Variables section)
   npm run dev
   ```

3. Frontend Setup:
   ```bash
   # In a new terminal
   cd ../src
   npm install
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CORS_ORIGINS=http://localhost:5173
```

## Deployment

The application is designed to be easily deployed on platforms like Railway.

### Deployment Steps (Railway)
1. Link your GitHub repository to Railway.
2. Add a new service from the repository.
3. Configure the environment variables in the Railway dashboard.
4. Ensure the build command and start command are correctly set for both frontend and backend.

## License
This project is licensed under the MIT License.
