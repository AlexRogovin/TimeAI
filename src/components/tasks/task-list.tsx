import { Task, useTaskStore } from "@/store/use-task-store";
import {
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  MoreVertical,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { format } from "date-fns";
import { TaskDialog } from "./task-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { cn } from "@/lib/utils";

export function TaskList() {
  const { tasks, deleteTask, getAISuggestions, updateTask } = useTaskStore();

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    updateTask(task.id, { status: newStatus });
  };

  const handleAISuggestions = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    getAISuggestions(taskId);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1"
              onClick={() => handleStatusChange(task)}
            >
              <CheckCircle
                className={cn(
                  "h-5 w-5",
                  task.status === "completed"
                    ? "text-green-500 fill-green-500"
                    : "text-muted-foreground"
                )}
              />
            </Button>
            <div
              className={cn(
                "space-y-1",
                task.status === "completed" && "text-muted-foreground line-through"
              )}
            >
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{task.title}</h4>
                <span
                  className={`h-2 w-2 rounded-full ${getPriorityColor(
                    task.priority
                  )}`}
                />
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{task.estimatedTime}m</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleAISuggestions(e, task.id)}
                >
                  <Brain className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-80"
                align="end"
                side="left"
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">AI Suggestions</h4>
                  {task.aiSuggestions ? (
                    <ul className="text-sm space-y-1">
                      {task.aiSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to get AI suggestions for this task
                    </p>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <TaskDialog
                    task={task}
                    trigger={
                      <button className="w-full text-left cursor-pointer">
                        Edit
                      </button>
                    }
                  />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No tasks yet. Click "Add Task" to create one.
        </div>
      )}
    </div>
  );
}