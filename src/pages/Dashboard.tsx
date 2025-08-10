import React from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, PlusCircle } from "lucide-react";
import { TaskStatus, Task } from "@/contexts/ProjectContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Dashboard = () => {
  const { projects, currentUser, setCurrentProject, createProject } = useProject();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#6366f1"); // default color
  const colorOptions = [
    "#6366f1", // indigo
    "#f59e42", // orange
    "#10b981", // green
    "#ef4444", // red
    "#fbbf24", // yellow
    "#3b82f6", // blue
    "#a855f7", // purple
  ];
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all tasks from all projects
  const allTasks = projects.flatMap((project) => project.tasks);
  
  // Get tasks assigned to current user (by email, not id)
  const userTasks = allTasks.filter((task) => {
    // Find the project this task belongs to
    const project = projects.find(p => p.tasks.some(t => t.id === task.id));
    if (!project) return false;
    // Find the member assigned to this task
    const member = project.members.find(m => m.id === task.assigneeId);
    return member?.email === currentUser.email;
  });
  
  // Helper to compare only the date part (ignoring time)
  const isOverdue = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    due.setHours(0,0,0,0);
    return due < today;
  };
  const isUpcoming = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    due.setHours(0,0,0,0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    return due >= today && due <= in7Days;
  };

  // Calculate various metrics
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === "completed"
  ).length;
  
  const upcomingTasks = userTasks.filter(
    (task) => 
      isUpcoming(task.dueDate) && 
      task.status !== "completed"
  );
  
  const overdueTasks = userTasks.filter(
    (task) => 
      isOverdue(task.dueDate) && 
      task.status !== "completed"
  );

  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Group tasks by status for chart data
  const tasksByStatus = allTasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const getStatusColor = (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      backlog: "text-muted-foreground",
      todo: "text-blue-500",
      "in-progress": "text-amber-500",
      review: "text-purple-500",
      completed: "text-green-500",
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center p-3 rounded-md border mb-2 hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium">{task.title}</h4>
        <div className="flex items-center mt-1">
          <span className={`text-xs ${getStatusColor(task.status)}`}>
            {task.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <span className="text-xs text-muted-foreground mx-2">•</span>
          <span className="text-xs text-muted-foreground">
            Due {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${
          task.priority === "high" || task.priority === "urgent"
            ? "bg-red-500"
            : task.priority === "medium"
            ? "bg-yellow-500"
            : "bg-blue-500"
        }`}
      />
    </div>
  );

  const handleNewProjectSubmit = async () => {
    if (!newProjectName.trim()) {
      toast({ title: "Error", description: "Project name is required." });
      return;
    }
    if (!newProjectDescription.trim()) {
      toast({ title: "Error", description: "Project description is required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const newProject = await createProject({ name: newProjectName, description: newProjectDescription, color: newProjectColor, members: [], tasks: [] });
      toast({ title: "Project Created", description: `Project '${newProject.name}' was created successfully.` });
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("#6366f1");
      setIsNewProjectDialogOpen(false);
    } catch (err) {
      console.error("Error (MongoDB Atlas) creating new project:", err);
      toast({ title: "Error", description: "Failed to create new project (MongoDB Atlas)." });
    } finally { setIsSubmitting (false); }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        
        {/* Project Selection */}
        <div className="flex items-center gap-4">
          <Select 
            onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              if (project) setCurrentProject(project);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="newProjectName">Project Name</Label>
                <Input id="newProjectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Enter project name" />
                <Label htmlFor="newProjectDescription">Description</Label>
                <Input id="newProjectDescription" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Enter project description" />
                <Label>Project Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-7 h-7 rounded-full border-2 transition-colors ${newProjectColor === color ? 'border-primary' : 'border-transparent'} focus:outline-none`}
                      style={{ background: color }}
                      onClick={() => setNewProjectColor(color)}
                    />
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button disabled={isSubmitting} onClick={handleNewProjectSubmit}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.length > 1 ? `${projects.length} active projects` : "1 active project"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueTasks.length} overdue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Task Distribution & Activity */}
      <div className="grid gap-4 md:grid-cols-7 mb-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Task status across all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tasksByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-16 text-sm font-medium capitalize">
                    {status.replace("-", " ")}
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === "completed"
                            ? "bg-green-500"
                            : status === "in-progress"
                            ? "bg-amber-500"
                            : status === "review"
                            ? "bg-purple-500"
                            : status === "todo"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                        style={{
                          width: `${(count / totalTasks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-muted-foreground font-medium">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allTasks
                .sort((a, b) => 
                  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : task.status === "in-progress"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {task.status === "completed" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : task.status === "in-progress" ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Updated {formatDate(task.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Tasks Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-1">
                {upcomingTasks
                  .sort((a, b) => 
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No upcoming tasks
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <CardDescription>Tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {overdueTasks.length > 0 ? (
              <div className="space-y-1">
                {overdueTasks
                  .sort((a, b) => 
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                  )
                  .map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No overdue tasks
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
