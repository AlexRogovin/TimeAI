import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGoogleCalendar } from "@/contexts/google-calendar-context";
import { Calendar, CheckCircle, Loader2, LogIn, LogOut } from "lucide-react";

export function GoogleCalendarIntegration() {
  const { isLoading, isAuthenticated, login, logout } = useGoogleCalendar();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to sync tasks and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Connection Status:</span>
              {isAuthenticated ? (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="text-muted-foreground">Not connected</span>
              )}
            </div>
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : isAuthenticated ? (
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button onClick={login}>
                <LogIn className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
          {isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Your tasks will be synced with Google Calendar. Any changes you make
              in either system will be reflected in both.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}