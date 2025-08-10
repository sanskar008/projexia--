import * as express from "express";
import Project from "../models/Project";
import Task from "../models/Task";
import ProjectMember from "../models/ProjectMember";
import ChatMessage from "../models/ChatMessage";

const router = express.Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const email = req.query.email;
    let filter = {};
    if (userId || email) {
      let memberIds: any[] = [];
      if (email) {
        // Find all ProjectMember docs with this email
        const members = await ProjectMember.find({ email });
        memberIds = members.map((m) => m._id);
      }
      filter = {
        $or: [
          userId ? { creatorId: userId } : null,
          memberIds.length > 0 ? { members: { $in: memberIds } } : null,
        ].filter(Boolean),
      };
    }
    const projects = await Project.find(filter)
      .populate({
        path: "tasks",
        populate: {
          path: "comments",
        },
      })
      .populate("members");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: "tasks",
        populate: {
          path: "comments",
        },
      })
      .populate("members");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    const creatorId = req.query.userId || req.body.creatorId;
    if (!creatorId) {
      return res.status(400).json({ message: "creatorId is required" });
    }
    if (!name || !description || !color) {
      return res
        .status(400)
        .json({ message: "name, description, and color are required" });
    }

    const newProject = new Project({
      name,
      description,
      color,
      tasks: [],
      members: [],
      creatorId,
    });

    const savedProject = await newProject.save();

    // Add members to the project
    if (members && members.length > 0) {
      const projectMembers = members.map((member: any) => ({
        ...member,
        projectId: savedProject._id,
      }));

      const savedMembers = await ProjectMember.insertMany(projectMembers);
      savedProject.members = savedMembers.map((member) => member._id);
      await savedProject.save();
    }

    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.updatedAt = new Date();

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.query.userId;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!userId || project.creatorId !== userId) {
      return res
        .status(403)
        .json({ message: "Only the admin can delete this project." });
    }
    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: project._id });
    // Delete all members associated with the project
    await ProjectMember.deleteMany({ projectId: project._id });
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Invite a member to a project
router.post("/:id/invite", async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if member already exists in the project
    const existingMember = await ProjectMember.findOne({ email, projectId });
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "Member already invited to this project" });
    }

    // Try to find a real user for this email
    let name = email;
    let avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      email
    )}`;
    try {
      const User = (await import("../models/User")).default;
      const user = await User.findOne({ email });
      if (user) {
        name = user.name;
        avatarUrl = user.avatarUrl || avatarUrl;
      }
    } catch (e) {
      /* ignore */
    }

    // Create new member
    const newMember = new ProjectMember({
      name,
      email,
      role: "member",
      avatarUrl,
      projectId,
    });
    await newMember.save();

    // Add member to project
    project.members.push(newMember._id);
    await project.save();

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Remove a member from a project
router.delete("/:projectId/members/:memberId", async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove member from project.members array
    project.members = project.members.filter(
      (m: any) => m.toString() !== memberId
    );
    await project.save();

    // Remove the ProjectMember document
    await ProjectMember.findByIdAndDelete(memberId);

    res.json({ message: "Member removed from project" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a project member's role
router.put("/:projectId/members/:memberId", async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    const member = await ProjectMember.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    member.role = role;
    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all chat messages for a project
router.get("/:id/chat", async (req, res) => {
  try {
    const projectId = req.params.id;
    const messages = await ChatMessage.find({ projectId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Post a new chat message to a project
router.post("/:id/chat", async (req, res) => {
  try {
    const projectId = req.params.id;
    const { userId, userName, content } = req.body;
    if (!userId || !userName || !content) {
      return res
        .status(400)
        .json({ message: "userId, userName, and content are required" });
    }
    const message = new ChatMessage({ projectId, userId, userName, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
