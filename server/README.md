# Projexia Backend API

Backend API server for Projexia project management application.

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **Passport.js** for authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/projexia
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   COOKIE_KEY=your-secret-cookie-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start the development server with ts-node
- `npm run lint` - Run ESLint

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check with database status
- `/api/projects` - Project management endpoints
- `/api/tasks` - Task management endpoints
- `/api/comments` - Comment endpoints
- `/api/auth` - Authentication endpoints

## Deployment

This backend is configured for deployment on Render. See `render.yaml` for configuration.

### Environment Variables for Production

- `MONGODB_URI` - MongoDB connection string
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `COOKIE_KEY` - Secret key for cookie sessions
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
