import { Project, Task, Comment, ProjectMember } from "@/contexts/ProjectContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }
  return response.json();
};

// Project API
export const fetchProjects = async (userId?: string, email?: string): Promise<Project[]> => {
  try {
    let url = `${API_URL}/projects`;
    const params = [];
    if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    console.log('Fetching projects from:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    const projects = await handleResponse(response);
    return projects.map((p: any) => ({
      ...p,
      id: p._id,
      color: p.color,
      members: p.members?.map((m: any) => ({ ...m, id: m._id })) || [],
      tasks: p.tasks?.map((t: any) => ({ ...t, id: t._id })) || [],
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`);
    const p = await handleResponse(response);
    return { ...p, id: p._id };
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
};

export const createProject = async (project: Omit<Project, "id" | "createdAt" | "updatedAt">, creatorId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects?userId=${creatorId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...project, creatorId }),
    });
    const p = await handleResponse(response);
    return { ...p, id: p._id, color: p.color };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete project");
    }
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
};

// Task API
export const fetchTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    const tasks = await handleResponse(response);
    return tasks.map((t: any) => ({ ...t, id: t._id }));
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    const t = await handleResponse(response);
    return { ...t, id: t._id };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};

export const addComment = async (taskId: string, comment: { content: string; userId: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error adding comment to task ${taskId}:`, error);
    throw error;
  }
};

// Project Member API
export const inviteProjectMember = async (
  projectId: string,
  member: { email: string }
): Promise<ProjectMember> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error inviting member to project ${projectId}:`, error);
    throw error;
  }
};

export const removeProjectMember = async (
  projectId: string,
  memberId: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to remove project member");
    }
  } catch (error) {
    console.error(`Error removing member ${memberId} from project ${projectId}:`, error);
    throw error;
  }
};

export const updateProjectMemberRole = async (
  projectId: string,
  memberId: string,
  role: string
): Promise<ProjectMember> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating member role for ${memberId} in project ${projectId}:`, error);
    throw error;
  }
};

// Group Chat API
export const fetchProjectChat = async (projectId: string) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/chat`);
  if (!response.ok) throw new Error('Failed to fetch chat messages');
  return response.json();
};

export const postProjectChatMessage = async (
  projectId: string,
  message: { userId: string; userName: string; content: string }
) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error('Failed to send chat message');
  return response.json();
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  const response = await fetch(`${API_URL}/auth/me/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, avatarUrl }),
  });
  if (!response.ok) throw new Error('Failed to update avatar');
  return response.json();
};
