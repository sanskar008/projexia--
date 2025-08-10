import React, { useState } from "react";
import { useProject, Task } from "../contexts/ProjectContext";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const Calendar = () => {
  const { projects } = useProject();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Always get all tasks from all projects
  const tasks = projects.flatMap((project) => project.tasks);

  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const dateKey = task.dueDate.split("T")[0];
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getDayTasks = (date: Date): Task[] => {
    const dateKey = date.toISOString().split("T")[0];
    return tasksByDate[dateKey] || [];
  };

  const getPriorityColor = (priority: string): string => {
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

  const getDayContent = (day: Date) => {
    const dayTasks = getDayTasks(day);
    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

    return (
      <div className="w-full h-full">
        <div
          className={`text-center ${
            isCurrentMonth ? "font-medium" : "text-muted-foreground"
          }`}
        >
          {day.getDate()}
        </div>
        {dayTasks.length > 0 && isCurrentMonth && (
          <div className="mt-1">
            {dayTasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className="text-xs px-1 py-0.5 mb-0.5 truncate rounded bg-primary/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task);
                }}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-xs text-center text-muted-foreground">
                +{dayTasks.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        <Card className="md:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Schedule</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              components={{
                DayContent: (props) => getDayContent(props.date),
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {selectedDate
                ? formatDate(selectedDate.toISOString())
                : "No Date Selected"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <>
                <h3 className="text-sm font-medium mb-2">Tasks Due</h3>
                {getDayTasks(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getDayTasks(selectedDate).map((task) => (
                      <Dialog key={task.id}>
                        <DialogTrigger asChild>
                          <div
                            className="p-3 border rounded-md cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="flex items-center mb-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(
                                  task.priority
                                )} mr-2`}
                              />
                              <span className="text-xs font-medium uppercase">
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          </div>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{task.title}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full ${getPriorityColor(
                                    task.priority
                                  )} mr-2`}
                                />
                                <span className="text-xs font-medium uppercase">
                                  {task.priority} Priority
                                </span>
                              </div>
                              <div className="text-xs">
                                Due: {formatDate(task.dueDate)}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">
                                  Description
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {task.description ||
                                    "No description provided."}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">
                                  Assigned To
                                </h4>
                                {task.assigneeId ? (
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage
                                        src={
                                          projects
                                            .flatMap((p) => p.members)
                                            .find(
                                              (m) => m.id === task.assigneeId
                                            )?.avatarUrl
                                        }
                                        alt={
                                          projects
                                            .flatMap((p) => p.members)
                                            .find(
                                              (m) => m.id === task.assigneeId
                                            )?.name || ""
                                        }
                                      />
                                      <AvatarFallback>
                                        {getInitials(
                                          projects
                                            .flatMap((p) => p.members)
                                            .find(
                                              (m) => m.id === task.assigneeId
                                            )?.name || ""
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">
                                      {
                                        projects
                                          .flatMap((p) => p.members)
                                          .find((m) => m.id === task.assigneeId)
                                          ?.name
                                      }
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Not assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks due on this date
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a date to view tasks
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
