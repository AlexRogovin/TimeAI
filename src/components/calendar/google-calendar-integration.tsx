import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Calendar, LogIn, LogOut, Check, X, RefreshCw } from "lucide-react";
import {
  loadGoogleScript,
  initializeGoogleClient,
  isUserSignedIn,
  signInToGoogle,
  signOutFromGoogle,
  getCalendarEvents,
  createCalendarEvent
} from "@/lib/google-calendar";
import { addMinutes, format } from "date-fns";

export function GoogleCalendarIntegration() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('Initializing...');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google API on component mount
  useEffect(() => {
    const initializeGoogle = async () => {
      setStatus('loading');
      setMessage('Loading Google API...');
      
      try {
        // Load the Google API script
        await loadGoogleScript();
        
        // Initialize the Google API client
        await initializeGoogleClient();
        setIsInitialized(true);
        
        // Check if user is already signed in
        const signedIn = isUserSignedIn();
        setIsSignedIn(signedIn);
        
        if (signedIn) {
          setMessage('Fetching calendar events...');
          await fetchEvents();
        }
        
        setStatus('success');
        setMessage(signedIn ? 'Connected to Google Calendar' : 'Ready to connect');
      } catch (err: any) {
        console.error('Google API initialization error:', err);
        setStatus('error');
        setError(err.message || 'Failed to initialize Google Calendar');
        setMessage('Failed to initialize');
      }
    };
    
    initializeGoogle();
  }, []);
  
  // Fetch calendar events
  const fetchEvents = async () => {
    if (!isInitialized || !isSignedIn) return;
    
    setStatus('loading');
    setMessage('Fetching calendar events...');
    
    try {
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const calendarEvents = await getCalendarEvents(now, thirtyDaysLater);
      setEvents(calendarEvents);
      
      setStatus('success');
      setMessage(`Found ${calendarEvents.length} events`);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setStatus('error');
      setError(err.message || 'Failed to fetch calendar events');
      setMessage('Failed to fetch events');
    }
  };
  
  // Handle sign in
  const handleSignIn = async () => {
    setStatus('loading');
    setMessage('Signing in to Google...');
    setError(null);
    
    try {
      await signInToGoogle();
      setIsSignedIn(true);
      await fetchEvents();
      
      setStatus('success');
      setMessage('Successfully connected to Google Calendar');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setStatus('error');
      setError(err.message || 'Failed to sign in to Google Calendar');
      setMessage('Sign in failed');
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    setStatus('loading');
    setMessage('Signing out...');
    setError(null);
    
    try {
      await signOutFromGoogle();
      setIsSignedIn(false);
      setEvents([]);
      
      setStatus('success');
      setMessage('Disconnected from Google Calendar');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setStatus('error');
      setError(err.message || 'Failed to sign out from Google Calendar');
      setMessage('Sign out failed');
    }
  };
  
  // Create a test event
  const handleCreateTestEvent = async () => {
    setStatus('loading');
    setMessage('Creating test event...');
    setError(null);
    
    try {
      const now = new Date();
      const thirtyMinutesLater = addMinutes(now, 30);
      
      await createCalendarEvent(
        'Test Event from TimeAI',
        'This is a test event created by the TimeAI application',
        now,
        thirtyMinutesLater
      );
      
      await fetchEvents();
      
      setStatus('success');
      setMessage('Test event created successfully');
    } catch (err: any) {
      console.error('Create event error:', err);
      setStatus('error');
      setError(err.message || 'Failed to create test event');
      setMessage('Failed to create event');
    }
  };
  
  // Refresh events
  const handleRefreshEvents = async () => {
    await fetchEvents();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : status === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : status === 'error' ? (
                <X className="h-4 w-4 text-red-500" />
              ) : null}
              <span className="text-sm font-medium">{message}</span>
            </div>
            
            <div className="flex gap-2">
              {isSignedIn ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleRefreshEvents}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCreateTestEvent}>
                    Create Test Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-1 h-3 w-3" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={handleSignIn} disabled={status === 'loading' || !isInitialized}>
                  <LogIn className="mr-1 h-3 w-3" />
                  Connect to Google Calendar
                </Button>
              )}
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Calendar Events */}
          {isSignedIn && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">
                Your Calendar Events ({events.length})
              </h3>
              
              {events.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                  {events.map((event) => (
                    <div key={event.id} className="p-2 border rounded-md hover:bg-accent/50 transition-colors">
                      <p className="font-medium text-sm">{event.summary}</p>
                      {event.start?.dateTime ? (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start.dateTime), "MMM d, yyyy h:mm a")}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          All day event on {event.start?.date}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No events found in your calendar</p>
              )}
            </div>
          )}
          
          {/* Troubleshooting Tips */}
          {status === 'error' && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Troubleshooting Tips:</h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Make sure popup blockers are disabled for this site</li>
                <li>• Check that third-party cookies are allowed in your browser</li>
                <li>• Try using Chrome or Edge for best compatibility</li>
                <li>• Ensure you're using a Google account with calendar access</li>
                <li>• Check the browser console for detailed error messages</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}