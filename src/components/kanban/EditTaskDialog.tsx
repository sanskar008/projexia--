import React, { useState } from "react";
import { useProject, Task, TaskStatus, TaskPriority } from "@/contexts/ProjectContext";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditTaskDialogProps {
  task: Task;
  onClose: () => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ task, onClose }) => {
  const { currentUser, currentProject, updateTask } = useProject();
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(task.dueDate));
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId || "");
  const [tags, setTags] = useState<string[]>(task.tags);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate?.toISOString(),
        assigneeId: assigneeId || undefined,
        tags,
      });
      setEditMode(false);
      onClose();
    } catch (error) {
      // Optionally show error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Read-only view
  if (!editMode) {
    return (
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <div className="border rounded px-3 py-2 bg-muted">{task.title}</div>
          </div>
          <div>
            <Label>Description</Label>
            <div className="border rounded px-3 py-2 bg-muted whitespace-pre-line">{task.description}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <div className="border rounded px-3 py-2 bg-muted capitalize">{task.status}</div>
            </div>
            <div>
              <Label>Priority</Label>
              <div className="border rounded px-3 py-2 bg-muted capitalize">{task.priority}</div>
            </div>
          </div>
          <div>
            <Label>Due Date</Label>
            <div className="border rounded px-3 py-2 bg-muted">{task.dueDate ? format(new Date(task.dueDate), "PPP") : "-"}</div>
          </div>
          <div>
            <Label>Assignee</Label>
            <div className="border rounded px-3 py-2 bg-muted">
              {currentProject?.members.find(m => m.id === task.assigneeId)?.name || "Unassigned"}
            </div>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {task.tags.length > 0 ? task.tags.map(tag => (
                <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">{tag}</span>
              )) : <span className="text-muted-foreground">No tags</span>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setEditMode(true)}>
            Edit
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  // Edit mode view
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleUpdateTask} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: TaskStatus) => setStatus(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value: TaskPriority) => setPriority(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee</Label>
          <Select
            value={assigneeId}
            onValueChange={setAssigneeId}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {currentProject?.members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddTag}
              disabled={isSubmitting || !newTag.trim()}
            >
              +
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isSubmitting}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default EditTaskDialog; 