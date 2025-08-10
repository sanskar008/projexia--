import React, { useState, useEffect } from "react";
import { useProject, Task, TaskStatus, TaskPriority } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Users, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import AddTaskDialog from "@/components/kanban/AddTaskDialog";
import InviteMemberDialog from "@/components/kanban/InviteMemberDialog";
import TaskFilter from "@/components/kanban/TaskFilter";
import TaskStatistics from "@/components/kanban/TaskStatistics";
import { format } from "date-fns";
import EditTaskDialog from "@/components/kanban/EditTaskDialog";
import * as api from "@/services/api";

const KanbanBoard = () => {
  const { currentProject, updateTask, loadTasks } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const { currentUser } = useProject();

  useEffect(() => {
    if (currentProject) {
      loadTasks(currentProject.id);
    }
  }, [currentProject, loadTasks]);

  const fetchChat = async () => {
    if (!currentProject) return;
    try {
      const messages = await api.fetchProjectChat(currentProject.id);
      setChatMessages(messages);
    } catch {}
  };

  useEffect(() => {
    if (chatOpen) fetchChat();
    // Optionally, add polling or websockets for real-time
  }, [chatOpen, currentProject]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentUser) return;
    try {
      const msg = await api.postProjectChatMessage(currentProject.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        content: chatInput.trim(),
      });
      setChatMessages((prev) => [...prev, msg]);
      setChatInput("");
    } catch {}
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-muted-foreground">
            Please select a project from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  // Get all unique tags from tasks
  const availableTags = Array.from(
    new Set(currentProject.tasks.flatMap((task) => task.tags))
  );

  // Filter tasks based on search term, priorities, and tags
  const filteredTasks = currentProject.tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    return matchesSearch && matchesPriority && matchesTags;
  });

  // Group tasks by status
  const columns: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    "in-progress": [],
    review: [],
    completed: [],
  };

  filteredTasks.forEach((task) => {
    columns[task.status].push(task);
  });

  const columnTitles: Record<TaskStatus, string> = {
    backlog: "Backlog",
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    completed: "Completed",
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await updateTask(draggedTask.id, { status });
      toast({
        title: "Task updated",
        description: `Task moved to ${columnTitles[status]}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
          <p className="text-muted-foreground">{currentProject.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setChatOpen(true)} title="Group Chat">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <InviteMemberDialog projectId={currentProject.id} />
          <AddTaskDialog projectId={currentProject.id} />
        </div>
      </div>

      {/* Task Statistics */}
      <TaskStatistics tasks={currentProject.tasks} />
      
      {/* Task Filters */}
      <TaskFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {Object.keys(columns).map((status) => (
          <div
            key={status}
            className="flex flex-col"
            onDrop={(e) => handleDrop(e, status as TaskStatus)}
            onDragOver={handleDragOver}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{columnTitles[status as TaskStatus]}</h3>
              <Badge variant="secondary">{columns[status as TaskStatus].length}</Badge>
            </div>
            <div className="flex-1 space-y-2 min-h-[200px] p-2 bg-muted/50 rounded-lg">
              {columns[status as TaskStatus].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className="mb-2 cursor-grab active:cursor-grabbing"
                >
                  <Dialog open={selectedTask?.id === task.id} onOpenChange={(open) => !open && setSelectedTask(null)}>
                    <DialogTrigger asChild>
                      <Card 
                        className="hover:border-primary transition-colors" 
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center mb-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`} />
                            <span className="text-xs font-medium uppercase">
                              {task.priority}
                            </span>
                            {new Date(task.dueDate) < new Date() && task.status !== "completed" && (
                              <div className="ml-auto flex items-center text-xs text-destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-medium mb-2">{task.title}</h4>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {task.assigneeId && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={currentProject.members.find(m => m.id === task.assigneeId)?.avatarUrl}
                                    alt={currentProject.members.find(m => m.id === task.assigneeId)?.name}
                                  />
                                  <AvatarFallback>
                                    {currentProject.members.find(m => m.id === task.assigneeId)?.name
                                      .split(" ")
                                      .map(n => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    {selectedTask?.id === task.id && (
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Task Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <div className="font-semibold">{task.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-3">{task.description}</div>
                          <div className="flex gap-2 text-xs mt-2">
                            <span>Status: <b className="capitalize">{task.status}</b></span>
                            <span>Priority: <b className="capitalize">{task.priority}</b></span>
                          </div>
                          <div className="text-xs">Due: {task.dueDate ? formatDate(task.dueDate) : "-"}</div>
                          <div className="text-xs">Assignee: {currentProject.members.find(m => m.id === task.assigneeId)?.name || "Unassigned"}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button size="sm" onClick={() => { setEditTask(task); setSelectedTask(null); }}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedTask(null)}>Close</Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                  {editTask?.id === task.id && (
                    <Dialog open={true} onOpenChange={(open) => !open && setEditTask(null)}>
                      <EditTaskDialog task={task} onClose={() => setEditTask(null)} />
                    </Dialog>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <Card className="shadow-none border-none bg-background">
            <div className="flex flex-col h-[500px]">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <DialogTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Group Chat
                </DialogTitle>
              </div>
              <CardContent className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-background">
                {chatMessages.length === 0 && <div className="text-center text-muted-foreground mt-8">No messages yet.</div>}
                {chatMessages.map((msg, idx) => {
                  const isSender = msg.userId === currentUser?.id;
                  const member = currentProject.members.find(m => m.id === msg.userId);
                  const avatarUrl = member?.avatarUrl || undefined;
                  const initials = member?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || (msg.userName[0] || '').toUpperCase();
                  return (
                    <div key={msg._id || idx} className="flex flex-col items-start w-full mb-2">
                      <span
                        className="mb-1 flex items-center gap-1"
                        style={{ alignSelf: isSender ? 'flex-end' : 'flex-start', marginRight: isSender ? '0.5rem' : undefined, marginLeft: !isSender ? '0.5rem' : undefined }}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={avatarUrl} alt={msg.userName} />
                          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                        </Avatar>
                        <Badge variant={isSender ? 'default' : 'secondary'} className="text-xs h-5 flex items-center">{msg.userName}</Badge>
                      </span>
                      <div
                        className={
                          "rounded-lg px-4 py-2 max-w-xs shadow-sm " +
                          (isSender ? "bg-primary text-primary-foreground ml-auto" : "bg-card text-card-foreground border")
                        }
                        style={{ alignSelf: isSender ? 'flex-end' : 'flex-start' }}
                      >
                        {msg.content}
                      </div>
                      <span
                        className="text-[10px] text-muted-foreground mt-1"
                        style={{ alignSelf: isSender ? 'flex-end' : 'flex-start', marginRight: isSender ? '0.5rem' : undefined, marginLeft: !isSender ? '0.5rem' : undefined }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className="text-[10px] text-muted-foreground"
                        style={{ alignSelf: isSender ? 'flex-end' : 'flex-start', marginRight: isSender ? '0.5rem' : undefined, marginLeft: !isSender ? '0.5rem' : undefined }}
                      >
                        {new Date(msg.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
              <form className="flex items-center border-t bg-background px-4 py-2" onSubmit={e => { e.preventDefault(); handleSendMessage(); }}>
                <input
                  className="flex-1 rounded-md border px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  autoFocus
                />
                <Button type="submit" variant="default" className="rounded-md px-4">Send</Button>
              </form>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
