import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Task, TaskPriority, useTaskStore } from "@/store/use-task-store";
import { useState } from "react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Switch } from "../ui/switch";
import { useGoogleCalendar } from "@/contexts/google-calendar-context";

interface TaskDialogProps {
  task?: Task;
  trigger?: React.ReactNode;
}

export function TaskDialog({ task, trigger }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium" as TaskPriority,
      status: "todo",
      estimatedTime: 30,
    }
  );
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);

  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const { isAuthenticated, createEvent, editEvent } = useGoogleCalendar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Handle task in local store
      if (task?.id) {
        updateTask(task.id, formData);
      } else {
        addTask(formData as Omit<Task, "id">);
      }

      // Sync with Google Calendar if enabled
      if (isAuthenticated && syncWithGoogle && formData.title && formData.dueDate) {
        const startTime = new Date(formData.dueDate);
        const endTime = addMinutes(startTime, formData.estimatedTime || 30);
        const description = formData.description || '';

        if (task?.id && task.googleEventId) {
          // Update existing Google Calendar event
          await editEvent(
            task.googleEventId,
            formData.title,
            description,
            startTime,
            endTime
          );
        } else {
          // Create new Google Calendar event
          const event = await createEvent(
            formData.title,
            description,
            startTime,
            endTime
          );
          
          // Store the Google event ID with the task
          if (!task?.id) {
            // For new tasks, we'll need to update it after creation
            // This is a simplification - in a real app, you'd need to handle this more robustly
            const tasks = useTaskStore.getState().tasks;
            const createdTask = tasks[tasks.length - 1];
            if (createdTask) {
              updateTask(createdTask.id, { googleEventId: event.id });
            }
          } else {
            // For existing tasks
            updateTask(task.id, { googleEventId: event.id });
          }
        }
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Create Task</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
            <DialogDescription>
              {task
                ? "Make changes to your task here"
                : "Add a new task to your schedule"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, dueDate: date || new Date() })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimated-time">Estimated Time (minutes)</Label>
              <Input
                id="estimated-time"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTime: parseInt(e.target.value),
                  })
                }
              />
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-google"
                  checked={syncWithGoogle}
                  onCheckedChange={setSyncWithGoogle}
                />
                <Label htmlFor="sync-google">
                  Add to Google Calendar
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">{task ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}