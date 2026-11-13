import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import type { DateRange } from "react-day-picker";

import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  subMonths,
} from "date-fns";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

import { useTaskStore } from "@/store/use-task-store";
import { TaskDialog } from "@/components/tasks/task-dialog";

import { cn } from "@/lib/utils";

import {
  isUserSignedIn,
  getCalendarEvents,
} from "@/lib/google-calendar";

/* ---------------------------------------
   Types
--------------------------------------- */

interface GoogleCalendarEvent {
  id: string;
  summary?: string;

  start?: {
    dateTime?: string;
    date?: string;
  };

  end?: {
    dateTime?: string;
    date?: string;
  };
}

interface TimelineItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  category: string;
  isTask: boolean;
  priority?: string;
  sortTime: number;
}

/* ---------------------------------------
   Date utilities
--------------------------------------- */

function parseCalendarDate(
  value?: string
): Date | null {
  if (!value) return null;

  const parsed = parseISO(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

/*
  Google Calendar uses exclusive end dates
  for all-day events.

  Timed events also use exclusive end times.

  This function checks whether an event
  overlaps the selected calendar day.
*/

function eventOccursOnDate(
  event: GoogleCalendarEvent,
  selectedDate: Date
): boolean {
  const start = parseCalendarDate(
    event.start?.dateTime ??
    event.start?.date
  );

  if (!start) return false;

  const end = parseCalendarDate(
    event.end?.dateTime ??
    event.end?.date
  );

  const dayStart = startOfDay(selectedDate);
  const dayEnd = addDays(dayStart, 1);

  if (!end || end <= start) {
    return isSameDay(start, selectedDate);
  }

  return start < dayEnd && end > dayStart;
}

/* ---------------------------------------
   Priority styling
--------------------------------------- */

function getPriorityColor(
  priority?: string
): string {
  switch (priority) {
    case "high":
      return "border-red-500";

    case "medium":
      return "border-yellow-500";

    case "low":
      return "border-green-500";

    default:
      return "border-border";
  }
}

/* ---------------------------------------
   Main component
--------------------------------------- */

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] =
    useState<Date>(() => new Date());

  const [visibleMonth, setVisibleMonth] =
    useState<Date>(() => new Date());

  const [date, setDate] =
    useState<DateRange | undefined>(() => ({
      from: new Date(),
      to: addDays(new Date(), 7),
    }));

  const [googleEvents, setGoogleEvents] =
    useState<GoogleCalendarEvent[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isGoogleConnected, setIsGoogleConnected] =
    useState(() => isUserSignedIn());

  const { tasks } = useTaskStore();

  /* ---------------------------------------
     Google Calendar synchronization
  --------------------------------------- */

  const rangeStart = date?.from?.getTime();
  const rangeEnd = date?.to?.getTime();

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      const signedIn = isUserSignedIn();

      setIsGoogleConnected(signedIn);

      if (
        !signedIn ||
        rangeStart === undefined
      ) {
        setGoogleEvents([]);
        setIsLoading(false);
        setError(null);
        return;
      }

      const from = new Date(rangeStart);

      /*
        If only one date is selected,
        fetch events for that day.
      */

      const to =
        rangeEnd !== undefined
          ? new Date(rangeEnd)
          : from;

      if (
        !isValidDate(from) ||
        !isValidDate(to)
      ) {
        setGoogleEvents([]);
        setIsLoading(false);
        setError("Invalid calendar date range.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        /*
          Extend the end boundary by one day
          so the selected final day is included
          when the API uses an exclusive end.
        */

        const events = await getCalendarEvents(
          startOfDay(from),
          addDays(startOfDay(to), 1)
        );

        if (cancelled) return;

        setGoogleEvents(
          Array.isArray(events)
            ? events
            : []
        );
      } catch (err: unknown) {
        if (cancelled) return;

        console.error(
          "Error fetching Google Calendar events:",
          err
        );

        setGoogleEvents([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch Google Calendar events."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchEvents();

    /*
      Prevent an outdated request from
      overwriting newer calendar data.
    */

    return () => {
      cancelled = true;
    };
  }, [rangeStart, rangeEnd]);

  /* ---------------------------------------
     Calendar navigation
  --------------------------------------- */

  const goToPreviousMonth = useCallback(() => {
    setVisibleMonth(current =>
      subMonths(current, 1)
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setVisibleMonth(current =>
      addMonths(current, 1)
    );
  }, []);

  const handleDayClick = useCallback(
    (day: Date) => {
      setSelectedDate(day);
    },
    []
  );

  /* ---------------------------------------
     Tasks for selected date
  --------------------------------------- */

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);

      return (
        isValidDate(dueDate) &&
        isSameDay(dueDate, selectedDate)
      );
    });
  }, [tasks, selectedDate]);

  /* ---------------------------------------
     Google events for selected date
  --------------------------------------- */

  const eventsForSelectedDate = useMemo(() => {
    return googleEvents.filter(event =>
      eventOccursOnDate(
        event,
        selectedDate
      )
    );
  }, [googleEvents, selectedDate]);

  /* ---------------------------------------
     Combined timeline
  --------------------------------------- */

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const taskItems: TimelineItem[] =
      tasksForSelectedDate.map(task => {
        const dueDate = new Date(task.dueDate);

        return {
          id: `task-${task.id}`,
          title: task.title,
          time: format(dueDate, "hh:mm a"),
          duration: `${task.estimatedTime}m`,
          category: task.category || "Task",
          isTask: true,
          priority: task.priority,
          sortTime: dueDate.getTime(),
        };
      });

    const eventItems: TimelineItem[] =
      eventsForSelectedDate.map(event => {
        const isAllDay =
          !event.start?.dateTime;

        const start = parseCalendarDate(
          event.start?.dateTime ??
          event.start?.date
        );

        const end = parseCalendarDate(
          event.end?.dateTime ??
          event.end?.date
        );

        let duration = "All day";

        if (
          !isAllDay &&
          start &&
          end
        ) {
          duration =
            `${format(start, "h:mm a")} - ` +
            `${format(end, "h:mm a")}`;
        }

        return {
          id: `google-${event.id}`,
          title:
            event.summary || "Untitled event",

          time:
            isAllDay || !start
              ? "All day"
              : format(start, "hh:mm a"),

          duration,

          category: "Google Calendar",
          isTask: false,

          /*
            All-day events appear first.
            Other events use numeric timestamps.
          */

          sortTime:
            isAllDay || !start
              ? Number.NEGATIVE_INFINITY
              : start.getTime(),
        };
      });

    return [
      ...taskItems,
      ...eventItems,
    ].sort(
      (a, b) => a.sortTime - b.sortTime
    );
  }, [
    tasksForSelectedDate,
    eventsForSelectedDate,
  ]);

  /* ---------------------------------------
     Calendar indicators
  --------------------------------------- */

  const taskDays = useMemo(() => {
    return tasks
      .map(task => new Date(task.dueDate))
      .filter(isValidDate);
  }, [tasks]);

  const googleDays = useMemo(() => {
    const days: Date[] = [];

    for (const event of googleEvents) {
      const start = parseCalendarDate(
        event.start?.dateTime ??
        event.start?.date
      );

      if (!start) continue;

      const end = parseCalendarDate(
        event.end?.dateTime ??
        event.end?.date
      );

      /*
        Mark each calendar day covered
        by an event, including multi-day events.
      */

      const firstDay = startOfDay(start);

      const lastDay = end
        ? startOfDay(
            new Date(end.getTime() - 1)
          )
        : firstDay;

      let current = firstDay;

      while (
        current <= lastDay &&
        days.length < 10000
      ) {
        days.push(current);

        current = addDays(current, 1);
      }
    }

    return days;
  }, [googleEvents]);

  /* ---------------------------------------
     Render
  --------------------------------------- */

  return (
    <main className="flex-1 space-y-4 p-4 md:p-8">

      {/* Header */}

      <div className="flex items-center justify-between gap-4">

        <h1 className="text-3xl font-bold">
          Calendar
        </h1>

        <div className="flex items-center gap-2">

          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

        </div>
      </div>

      {/* Main grid */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">

        {/* Calendar */}

        <Card className="min-w-0 lg:col-span-5">

          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">

            <CardTitle>
              Schedule
            </CardTitle>

            <div className="flex flex-wrap items-center gap-4">

              {isLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  TimeAI Tasks
                </span>

                {isGoogleConnected && (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Google Calendar
                  </span>
                )}

              </div>
            </div>

          </CardHeader>

          <CardContent className="overflow-x-auto">

            <Calendar
              mode="range"
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              selected={date}
              onSelect={setDate}
              onDayClick={handleDayClick}
              className="rounded-md border"

              modifiers={{
                activeDay: selectedDate,
                taskDay: taskDays,
                googleDay: googleDays,
              }}

              modifiersStyles={{
                activeDay: {
                  backgroundColor:
                    "hsl(var(--primary) / 0.2)",
                },

                taskDay: {
                  border:
                    "2px solid hsl(var(--primary))",
                },

                googleDay: {
                  outline:
                    "2px solid #3b82f6",
                  outlineOffset: "-2px",
                },
              }}
            />

          </CardContent>
        </Card>

        {/* Daily timeline */}

        <Card className="min-w-0 lg:col-span-2">

          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">

            <CardTitle className="text-lg">
              {format(
                selectedDate,
                "MMMM d, yyyy"
              )}
            </CardTitle>

            <TaskDialog
              trigger={
                <Button size="sm">
                  Add Task
                </Button>
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

                {timelineItems.map(item => (

                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-4 rounded-lg border p-3",

                      item.isTask
                        ? `border-l-4 ${getPriorityColor(item.priority)}`
                        : "border-l-4 border-blue-500"
                    )}
                  >

                    {item.isTask ? (

                      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    ) : (

                      <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

                    )}

                    <div className="min-w-0 space-y-1">

                      <p className="break-words text-sm font-medium">
                        {item.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">

                        <span>
                          {item.time}
                        </span>

                        <span>•</span>

                        <span>
                          {item.duration}
                        </span>

                      </div>

                      <div
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",

                          item.isTask
                            ? "bg-primary/10 text-primary"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}
                      >
                        {item.category}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center text-muted-foreground">
                No events scheduled for this day
              </div>

            )}

            {/* Error message */}

            {error && (

              <div
                role="alert"
                className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </div>

            )}

          </CardContent>
        </Card>

      </div>

    </main>
  );
}
