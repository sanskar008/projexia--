import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Grid,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, projects, currentProject, createProject, isLoading, logout, setCurrentProject, deleteProject } = useProject();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");
  const [newProjectColor, setNewProjectColor] = React.useState("#6366f1");
  const colorOptions = [
    "#6366f1", // indigo
    "#f59e42", // orange
    "#10b981", // green
    "#ef4444", // red
    "#fbbf24", // yellow
    "#3b82f6", // blue
    "#a855f7", // purple
  ];
  const [showAdminDeleteDialog, setShowAdminDeleteDialog] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kanban Board", href: "/kanban", icon: Grid },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please provide a name for the project",
        variant: "destructive",
      });
      return;
    }
    if (!newProjectDescription.trim()) {
      toast({
        title: "Project description required",
        description: "Please provide a description for the project",
        variant: "destructive",
      });
      return;
    }
    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        color: newProjectColor,
        members: currentUser ? [{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: "admin",
          avatarUrl: currentUser.avatarUrl,
        }] : [],
        tasks: [],
      });
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor("#6366f1");
      setShowNewProjectDialog(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await deleteProject(projectId);
      toast({ title: 'Project deleted', description: 'The project was deleted successfully.' });
    } catch (error: any) {
      if (typeof error.message === 'string' && error.message.includes('Only the admin can delete this project')) {
        setShowAdminDeleteDialog(true);
      } else {
        toast({ title: 'Error', description: 'Failed to delete project.', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Delete Dialog */}
      <Dialog open={showAdminDeleteDialog} onOpenChange={setShowAdminDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permission Denied</DialogTitle>
          </DialogHeader>
          <div>Only the admin can delete this project.</div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowAdminDeleteDialog(false)} autoFocus>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0 left-0 z-30",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ position: 'sticky', top: 0, height: '100vh' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold text-primary">
              Projexia
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <Menu /> : <X />}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon
                className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Projects List */}
        <div className="flex-shrink-0">
          <div className="p-4 flex items-center justify-between">
            {!collapsed && <h3 className="text-sm font-medium">Projects</h3>}
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={collapsed ? "mx-auto" : ""}
                  disabled={isLoading}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="grid gap-2">
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
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreateProject} disabled={isLoading}>
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="px-2 space-y-1 max-h-48 overflow-y-auto">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center group">
                <Link
                  to={`/kanban?project=${project.id}`}
                  className={cn(
                    "flex-1 flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentProject?.id === project.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setCurrentProject(project)}
                >
                  <div className="w-2 h-2 rounded-full mr-2" style={{ background: project.color }}></div>
                  {!collapsed && <span className="truncate">{project.name}</span>}
                </Link>
                {!collapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteProject(project.id)}
                    title="Delete Project"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* User Menu */}
        {currentUser && (
          <div className="p-4 flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
