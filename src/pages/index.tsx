import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle, Clock, ListTodo, Plus } from "lucide-react";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/use-task-store";

export default function Dashboard() {
  const tasks = useTaskStore((state) => state.tasks);
  
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      title: "Tasks Completed",
      value: completedTasks.toString(),
      description: "Today",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Upcoming Tasks",
      value: (totalTasks - completedTasks).toString(),
      description: "To do",
      icon: ListTodo,
      color: "text-blue-500",
    },
    {
      title: "Focus Time",
      value: "4h 30m",
      description: "Today",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "AI Suggestions",
      value: "3",
      description: "New insights",
      icon: Brain,
      color: "text-amber-500",
    },
  ];

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <TaskDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">Task Completion</span>
                  </div>
                  <span className="text-muted-foreground">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <Progress value={completionRate} />
              </div>
              <div className="flex items-start space-x-4">
                <Brain className="mt-0.5 h-5 w-5 text-amber-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Best Focus Time</p>
                  <p className="text-sm text-muted-foreground">
                    Your productivity peaks between 9 AM and 11 AM
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Brain className="mt-0.5 h-5 w-5 text-amber-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Task Pattern</p>
                  <p className="text-sm text-muted-foreground">
                    You complete most tasks in the morning
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}