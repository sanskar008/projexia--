const express = require("express");
const Project = require("../dist/models/Project.js");
const Task = require("../dist/models/Task.js");
const ProjectMember = require("../dist/models/ProjectMember.js");
const ChatMessage = require("../dist/models/ChatMessage.js");

const router = express.Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    const email = req.query.email;
    let filter = {};
    if (userId || email) {
      let memberIds = [];
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
        populate: { path: "comments" },
      })
      .populate("members");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ...other project routes can be added here...

module.exports = router;
