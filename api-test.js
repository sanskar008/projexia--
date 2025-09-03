import fetch from "node-fetch";

// Simple Node.js script to test your main API endpoints
// Run with: node api-test.js

const API_URL = "http://localhost:5000/api"; // Change if needed

async function testAPI() {
  try {
    // 1. Fetch all projects
    let res = await fetch(`${API_URL}/projects`);
    console.log("GET /projects:", res.status, await res.json());

    // 2. Create a project
    res = await fetch(`${API_URL}/projects?userId=testuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Project", description: "API test" }),
    });
    const project = await res.json();
    console.log("POST /projects:", res.status, project);

    // 3. Fetch project by ID
    res = await fetch(`${API_URL}/projects/${project._id || project.id}`);
    console.log("GET /projects/:id:", res.status, await res.json());

    // 4. Create a task
    res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project._id || project.id,
        title: "Test Task",
        description: "Task for API test",
        status: "todo",
        priority: "medium",
        dueDate: new Date().toISOString(),
        creatorId: "testuser",
        tags: [],
        comments: [],
        attachments: [],
      }),
    });
    const task = await res.json();
    console.log("POST /tasks:", res.status, task);

    // 5. Fetch tasks by project
    res = await fetch(`${API_URL}/tasks/project/${project._id || project.id}`);
    console.log("GET /tasks/project/:id:", res.status, await res.json());

    // 6. Delete task
    if (task._id || task.id) {
      res = await fetch(`${API_URL}/tasks/${task._id || task.id}`, {
        method: "DELETE",
      });
      console.log("DELETE /tasks/:id:", res.status);
    }

    // 7. Delete project
    if (project._id || project.id) {
      res = await fetch(`${API_URL}/projects/${project._id || project.id}`, {
        method: "DELETE",
      });
      console.log("DELETE /projects/:id:", res.status);
    }
  } catch (err) {
    console.error("API test error:", err);
  }
}

testAPI();
