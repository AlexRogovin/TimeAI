import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";

export function NotificationsPopover() {
  const notifications = [
    {
      id: 1,
      title: "Task Due Soon",
      description: "Project Meeting starts in 30 minutes",
      time: "30m",
    },
    {
      id: 2,
      title: "AI Suggestion",
      description: "Your most productive hours are between 9 AM and 11 AM",
      time: "1h",
    },
    {
      id: 3,
      title: "Task Completed",
      description: "Code Review has been marked as complete",
      time: "2h",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Notifications</h4>
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
          </div>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-4 rounded-lg p-2 hover:bg-muted"
              >
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {notification.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}