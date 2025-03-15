import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Placeholder tasks data
  const tasks = [
    {
      id: 1,
      title: "Project Meeting",
      time: "09:00 AM",
      duration: "1h",
      category: "Work",
    },
    {
      id: 2,
      title: "Code Review",
      time: "11:00 AM",
      duration: "2h",
      category: "Development",
    },
    {
      id: 3,
      title: "Team Sync",
      time: "02:00 PM",
      duration: "30m",
      category: "Team",
    },
  ];

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-5">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-4 rounded-lg border p-3"
                >
                  <Clock className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.time}</span>
                      <span>•</span>
                      <span>{task.duration}</span>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {task.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}