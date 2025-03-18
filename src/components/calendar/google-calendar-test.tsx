import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  loadGoogleApiScript,
  initGoogleApiClient,
  checkSignInStatus,
  signInUser,
  signOutUser,
  fetchCalendarEvents,
  createCalendarEvent
} from "@/lib/google-calendar-direct";
import { Loader2 } from "lucide-react";

export function GoogleCalendarTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google API on component mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await loadGoogleApiScript();
        await initGoogleApiClient();
        setIsInitialized(true);
        const signedIn = checkSignInStatus();
        setIsSignedIn(signedIn);
        if (signedIn) {
          const calendarEvents = await fetchCalendarEvents();
          setEvents(calendarEvents);
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize Google Calendar");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInUser();
      setIsSignedIn(true);
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in to Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOutUser();
      setIsSignedIn(false);
      setEvents([]);
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out from Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      await createCalendarEvent(
        "Test Event from TimeAI",
        "This is a test event created by TimeAI",
        now,
        oneHourLater
      );
      
      // Refresh events
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
    } catch (err: any) {
      console.error("Create event error:", err);
      setError(err.message || "Failed to create event in Google Calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Calendar Integration Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status:</p>
              <p className="text-sm text-muted-foreground">
                {isInitialized ? "Initialized" : "Not Initialized"} | 
                {isSignedIn ? " Signed In" : " Not Signed In"}
              </p>
            </div>
            
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : isSignedIn ? (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
                <Button onClick={handleCreateEvent}>
                  Create Test Event
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} disabled={!isInitialized}>
                Sign In with Google
              </Button>
            )}
          </div>

          {isSignedIn && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Your Calendar Events</h3>
              {events.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.id} className="p-2 border rounded">
                      <p className="font-medium">{event.summary}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.start.dateTime).toLocaleString()} - 
                        {new Date(event.end.dateTime).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events found in your calendar</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}