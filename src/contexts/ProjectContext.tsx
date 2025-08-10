import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "../hooks/use-toast";
import * as api from "../services/api";
import {
  authService,
  User,
  LoginCredentials,
  SignupData,
} from "../services/auth";

// Define types for our data structures
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "review"
  | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string | null;
  creatorId: string;
  attachments: string[];
  comments: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: Task[];
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarUrl: string;
}

interface ProjectContextType {
  // User management
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;

  // Project management
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => Promise<Project>;
  updateProject: (id: string, project: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  // Task management
  tasks: Task[];
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<Comment>;
  // Add loadTasks to the context type
  loadTasks: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from auth service and load projects
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          await loadProjects();
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load projects. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Load projects when user changes
  useEffect(() => {
    if (currentUser) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setTasks([]);
    }
  }, [currentUser]);

  // Load tasks when current project changes
  useEffect(() => {
    if (currentProject) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [currentProject]);

  const loadProjects = async () => {
    try {
      setError(null);
      const data = await api.fetchProjects(currentUser?.id, currentUser?.email);
      setProjects(data);

      // If no current project is selected, select the first one
      if (data.length > 0 && !currentProject) {
        setCurrentProject(data[0]);
      }

      // If current project exists but not in the loaded projects, clear it
      if (currentProject && !data.find((p) => p.id === currentProject.id)) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects. Please try refreshing the page.");
    }
  };

  const loadTasks = async () => {
    if (!currentProject || !currentProject.id) return;

    try {
      setError(null);
      const data = await api.fetchTasksByProject(currentProject.id);
      setTasks(data);

      // Update current project with latest tasks
      setCurrentProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: data,
        };
      });
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Failed to load tasks. Please try refreshing the page.");
    }
  };

  // User management functions
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const user = await authService.signup(data);
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Project management functions
  const createProject = async (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setError(null);
      if (!currentUser) throw new Error("No user logged in");
      const newProject = await api.createProject(project, currentUser.id);
      setProjects((prev) => [...prev, newProject]);
      setCurrentProject(newProject);
      return newProject;
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. (MongoDB Atlas)");
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setError(null);
      const updatedProject = await api.updateProject(id, updates);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      if (currentProject && currentProject.id === id) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      console.error("Error updating project (MongoDB Atlas):", err);
      setError("Failed to update project (MongoDB Atlas).");
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setError(null);
      if (!currentUser) throw new Error("No user logged in");
      await api.deleteProject(id, currentUser.id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        // Set the first available project as current, or null if none exist
        const remainingProjects = projects.filter((p) => p.id !== id);
        setCurrentProject(remainingProjects[0] || null);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
      throw err;
    }
  };

  // Task management functions
  const createTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setError(null);
      const newTask = await api.createTask(task);
      setTasks((prev) => [...prev, newTask]);
      // Update current project with the new task
      if (currentProject?.id === task.projectId) {
        setCurrentProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: [...prev.tasks, newTask],
          };
        });
      }
      // Refresh all projects so Dashboard stays up to date
      await loadProjects();
      return newTask;
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Failed to create task. Please try again.");
      throw err;
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await api.updateTask(id, task);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      // Update current project with the updated task
      if (currentProject) {
        setCurrentProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === id ? updatedTask : t)),
          };
        });
      }
      // Refresh all projects so Dashboard stays up to date
      await loadProjects();
      return updatedTask;
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      // Update current project by removing the deleted task
      if (currentProject) {
        setCurrentProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            tasks: prev.tasks.filter((t) => t.id !== id),
          };
        });
      }
      // Refresh all projects so Dashboard stays up to date
      await loadProjects();
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
      throw err;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    if (!currentUser) {
      throw new Error("User must be logged in to add comments");
    }

    try {
      setError(null);
      const comment = await api.addComment(taskId, {
        content,
        userId: currentUser.id,
      });

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: [...task.comments, comment],
            };
          }
          return task;
        })
      );

      return comment;
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
      throw err;
    }
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    signup,
    logout,
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    tasks,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    // Add loadTasks to the provider value
    loadTasks: async (projectId: string) => {
      // Temporarily set currentProject to the one matching projectId, if not already set
      if (!currentProject || currentProject.id !== projectId) {
        const project = projects.find((p) => p.id === projectId);
        if (project) setCurrentProject(project);
      }
      // Call the existing loadTasks function
      await loadTasks();
    },
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
