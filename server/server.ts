import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      'https://projexia-eight.vercel.app',
      'https://projexia.sanskarkoserwal.online',
    ];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running',
    message: 'Projexia API Server'
  });
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB URI: ${MONGODB_URI}`);
      console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();
