import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  estimatedTime: number; // in minutes
  actualTime?: number;
  aiSuggestions?: string[];
  googleEventId?: string; // ID of the corresponding Google Calendar event
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getAISuggestions: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { ...task, id: Math.random().toString(36).substr(2, 9) },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      getAISuggestions: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  aiSuggestions: [
                    "Break this task into smaller subtasks",
                    "Schedule this during your peak productivity hours (9-11 AM)",
                    "Consider collaborating with team members",
                  ],
                }
              : task
          ),
        })),
    }),
    {
      name: "timeai-tasks",
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);