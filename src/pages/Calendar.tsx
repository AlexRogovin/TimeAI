import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, isSameDay, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useTaskStore } from "@/store/use-task-store";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { cn } from "@/lib/utils";
import { 
  isUserSignedIn, 
  getCalendarEvents 
} from "@/lib/google-calendar";

export default function CalendarPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { tasks } = useTaskStore();

  // Fetch Google Calendar events when date range changes
  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (!isUserSignedIn() || !date?.from || !date?.to) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const events = await getCalendarEvents(date.from, date.to);
        setGoogleEvents(events);
      } catch (err: any) {
        console.error('Error fetching Google Calendar events:', err);
        setError(err.message || 'Failed to fetch Google Calendar events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoogleEvents();
  }, [date]);

  // Get tasks for the selected date
  const tasksForSelectedDate = tasks.filter((task) => 
    isSameDay(new Date(task.dueDate), selectedDate)
  );

  // Get Google Calendar events for the selected date
  const eventsForSelectedDate = googleEvents.filter((event) => {
    if (event.start?.dateTime) {
      return isSameDay(parseISO(event.start.dateTime), selectedDate);
    } else if (event.start?.date) {
      return isSameDay(parseISO(event.start.date), selectedDate);
    }
    return false;
  });

  // Combined timeline items
  const timelineItems = [
    ...tasksForSelectedDate.map(task => ({
      id: task.id,
      title: task.title,
      time: format(new Date(task.dueDate), "hh:mm a"),
      duration: `${task.estimatedTime}m`,
      category: task.category || "Task",
      isTask: true,
      priority: task.priority
    })),
    ...eventsForSelectedDate.map(event => ({
      id: event.id,
      title: event.summary,
      time: event.start?.dateTime 
        ? format(parseISO(event.start.dateTime), "hh:mm a")
        : "All day",
      duration: event.start?.dateTime && event.end?.dateTime
        ? `${format(parseISO(event.start.dateTime), "h:mm a")} - ${format(parseISO(event.end.dateTime), "h:mm a")}`
        : "All day",
      category: "Google Calendar",
      isTask: false
    }))
  ].sort((a, b) => {
    // Sort by time
    if (a.time === "All day") return -1;
    if (b.time === "All day") return 1;
    return a.time.localeCompare(b.time);
  });

  // Function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-green-500";
      default:
        return "";
    }
  };

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
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Loading...
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  TimeAI Tasks
                </span>
                {isUserSignedIn() && (
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Google Calendar
                  </span>
                )}
              </div>
            </div>
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
                taskDay: tasks.map(task => new Date(task.dueDate)),
                googleDay: googleEvents
                  .filter(event => event.start?.dateTime || event.start?.date)
                  .map(event => event.start?.dateTime 
                    ? parseISO(event.start.dateTime) 
                    : parseISO(event.start.date)
                  )
              }}
              modifiersStyles={{
                selected: { backgroundColor: 'hsl(var(--primary) / 0.2)' },
                taskDay: { border: '2px solid hsl(var(--primary))' },
                googleDay: { border: '2px solid hsl(var(--blue-500))' }
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
                      item.isTask 
                        ? `border-l-4 ${getPriorityColor(item.priority)}` 
                        : "border-l-4 border-blue-500"
                    )}
                  >
                    {item.isTask ? (
                      <Clock className="mt-0.5 h-5 w-5 text-primary" />
                    ) : (
                      <CalendarIcon className="mt-0.5 h-5 w-5 text-blue-500" />
                    )}
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
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
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
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}