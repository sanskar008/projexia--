
import * as express from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import Comment from '../models/Comment';

const router = express.Router();

// Get tasks by project ID
router.get('/project/:projectId', async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('comments');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('comments');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      creatorId,
      tags,
      projectId
    } = req.body;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      creatorId,
      attachments: [],
      comments: [],
      tags,
      projectId
    });
    
    const savedTask = await newTask.save();
    
    // Add task to project
    project.tasks.push(savedTask._id);
    project.updatedAt = new Date();
    await project.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      tags
    } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assigneeId = assigneeId !== undefined ? assigneeId : task.assigneeId;
    task.tags = tags || task.tags;
    task.updatedAt = new Date();
    
    const updatedTask = await task.save();
    
    // Update project's updatedAt
    await Project.findByIdAndUpdate(task.projectId, { updatedAt: new Date() });
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Remove task from project
    await Project.findByIdAndUpdate(
      task.projectId,
      { 
        $pull: { tasks: task._id },
        updatedAt: new Date()
      }
    );
    
    // Delete all comments associated with the task
    await Comment.deleteMany({ taskId: task._id });
    
    // Delete the task
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Add a comment to a task
router.post('/:id/comments', async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const newComment = new Comment({
      content,
      userId,
      taskId: task._id
    });
    
    const savedComment = await newComment.save();
    
    // Add comment to task
    task.comments.push(savedComment._id);
    task.updatedAt = new Date();
    await task.save();
    
    // Update project's updatedAt
    await Project.findByIdAndUpdate(task.projectId, { updatedAt: new Date() });
    
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
