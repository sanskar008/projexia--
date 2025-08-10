import React from "react";
// Update the import path below to the correct location of ProjectContext
// Example: import { Task } from "../../contexts/ProjectContext";
import { Task } from "../../contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

interface TaskStatisticsProps {
  tasks: Task[];
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ tasks }) => {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const reviewTasks = tasks.filter((task) => task.status === "review").length;
  const backlogTasks = tasks.filter((task) => task.status === "backlog").length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get tasks that are overdue
  const overdueTasks = tasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "completed"
  ).length;

  // Get high and urgent priority tasks
  const highPriorityTasks = tasks.filter(
    (task) =>
      (task.priority === "high" || task.priority === "urgent") &&
      task.status !== "completed"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <Progress value={completionPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedTasks} of {totalTasks} tasks complete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <Loader2 className="h-4 w-4 text-amber-500" />
          </div>
          <Progress
            value={(inProgressTasks / totalTasks) * 100}
            className="mt-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {todoTasks} to do, {reviewTasks} in review
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{overdueTasks}</div>
            <Clock className="h-4 w-4 text-red-500" />
          </div>
          <Progress
            value={(overdueTasks / totalTasks) * 100}
            className="mt-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {overdueTasks} tasks past due date
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{highPriorityTasks}</div>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
          <Progress
            value={(highPriorityTasks / totalTasks) * 100}
            className="mt-2 bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {backlogTasks} in backlog
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStatistics;
