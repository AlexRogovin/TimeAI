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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function GoogleCalendarTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Not initialized");

  // Initialize Google API on component mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      setStatus("Loading Google API...");
      
      try {
        await loadGoogleApiScript();
        setStatus("Initializing Google API client...");
        await initGoogleApiClient();
        setIsInitialized(true);
        setStatus("Checking sign-in status...");
        const signedIn = checkSignInStatus();
        setIsSignedIn(signedIn);
        
        if (signedIn) {
          setStatus("Fetching calendar events...");
          const calendarEvents = await fetchCalendarEvents();
          setEvents(calendarEvents);
          setStatus("Ready - Signed in");
        } else {
          setStatus("Ready - Not signed in");
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize Google Calendar");
        setStatus("Error during initialization");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setStatus("Signing in...");
    
    try {
      await signInUser();
      setIsSignedIn(true);
      setStatus("Fetching calendar events...");
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
      setStatus("Ready - Signed in");
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in to Google Calendar");
      setStatus("Error during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    setStatus("Signing out...");
    
    try {
      await signOutUser();
      setIsSignedIn(false);
      setEvents([]);
      setStatus("Ready - Not signed in");
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out from Google Calendar");
      setStatus("Error during sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    setError(null);
    setStatus("Creating test event...");
    
    try {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      await createCalendarEvent(
        "Test Event from TimeAI",
        "This is a test event created by TimeAI",
        now,
        oneHourLater
      );
      
      setStatus("Refreshing events...");
      const calendarEvents = await fetchCalendarEvents();
      setEvents(calendarEvents);
      setStatus("Ready - Event created");
    } catch (err: any) {
      console.error("Create event error:", err);
      setError(err.message || "Failed to create event in Google Calendar");
      setStatus("Error creating event");
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status: {status}</p>
              <p className="text-sm text-muted-foreground">
                {isInitialized ? "API Initialized" : "API Not Initialized"} | 
                {isSignedIn ? " Signed In" : " Not Signed In"}
              </p>
            </div>
            
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status}...
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

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSignedIn && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Your Calendar Events ({events.length})</h3>
              {events.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {events.map((event) => (
                    <div key={event.id} className="p-2 border rounded">
                      <p className="font-medium">{event.summary}</p>
                      {event.start?.dateTime ? (
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start.dateTime).toLocaleString()} - 
                          {new Date(event.end.dateTime).toLocaleTimeString()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          All day event on {event.start?.date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events found in your calendar</p>
              )}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h3 className="text-sm font-medium mb-2">Troubleshooting Tips:</h3>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Make sure popup blockers are disabled for this site</li>
              <li>• Check that third-party cookies are allowed in your browser</li>
              <li>• Ensure you're using a Google account with calendar access</li>
              <li>• Try using Chrome or Edge for best compatibility</li>
              <li>• If issues persist, check browser console for detailed errors</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}