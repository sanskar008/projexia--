
import * as express from 'express';
import Comment from '../models/Comment';
import Task from '../models/Task';
import mongoose from 'mongoose';

const router = express.Router();

// Get all comments for a task
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    const comments = await Comment.find({ taskId });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new comment
router.post('/', async (req, res) => {
  try {
    const { content, userId, taskId } = req.body;
    
    if (!content || !userId || !taskId) {
      return res.status(400).json({ message: 'Content, userId, and taskId are required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const newComment = new Comment({
      content,
      userId,
      taskId,
      createdAt: new Date()
    });
    
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    const comment = await Comment.findByIdAndDelete(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
