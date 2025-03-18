import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useGoogleCalendar } from "@/contexts/google-calendar-context";
import { useTaskStore } from "@/store/use-task-store";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { isLoading, isAuthenticated, events, refreshEvents } = useGoogleCalendar();
  const { tasks } = useTaskStore();

  useEffect(() => {
    if (isAuthenticated && date?.from && date?.to) {
      refreshEvents(date.from, date.to);
    }
  }, [isAuthenticated, date, refreshEvents]);

  // Get tasks for the selected date
  const tasksForSelectedDate = tasks.filter((task) => 
    isSameDay(new Date(task.dueDate), selectedDate)
  );

  // Get Google Calendar events for the selected date
  const eventsForSelectedDate = events.filter((event) => 
    isSameDay(parseISO(event.start.dateTime), selectedDate)
  );

  // Combined timeline items
  const timelineItems = [
    ...tasksForSelectedDate.map(task => ({
      id: task.id,
      title: task.title,
      time: format(new Date(task.dueDate), "hh:mm a"),
      duration: `${task.estimatedTime}m`,
      category: task.category || "Task",
      isTask: true
    })),
    ...eventsForSelectedDate.map(event => ({
      id: event.id,
      title: event.summary,
      time: format(parseISO(event.start.dateTime), "hh:mm a"),
      duration: format(parseISO(event.start.dateTime), "hh:mm a") + " - " + 
                format(parseISO(event.end.dateTime), "hh:mm a"),
      category: "Google Calendar",
      isTask: false
    }))
  ].sort((a, b) => {
    // Sort by time
    return a.time.localeCompare(b.time);
  });

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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Schedule</CardTitle>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  TimeAI Tasks
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Google Calendar
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              onDayClick={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                selected: selectedDate,
                googleEvent: events.map(event => parseISO(event.start.dateTime)),
                taskEvent: tasks.map(task => new Date(task.dueDate))
              }}
              modifiersStyles={{
                selected: { backgroundColor: 'hsl(var(--primary) / 0.2)' },
                googleEvent: { border: '2px solid hsl(var(--success))' },
                taskEvent: { border: '2px solid hsl(var(--primary))' }
              }}
            />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            <TaskDialog 
              trigger={
                <Button size="sm">Add Task</Button>
              }
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timelineItems.length > 0 ? (
              <div className="space-y-4">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start space-x-4 rounded-lg border p-3",
                      item.isTask ? "border-l-4 border-l-primary" : "border-l-4 border-l-green-500"
                    )}
                  >
                    <Clock className={cn(
                      "mt-0.5 h-5 w-5",
                      item.isTask ? "text-primary" : "text-green-500"
                    )} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </div>
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        item.isTask 
                          ? "bg-primary/10 text-primary" 
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      )}>
                        {item.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No events scheduled for this day
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}