import { useState, useEffect } from "react";

// Google Calendar API configuration
const GOOGLE_CONFIG = {
  apiKey: 'AIzaSyAIq-9g9nreVb_HGULo5oI-NA8TBNorIks',
  clientId: '133908799105-qt1r7ptinl87dfe5jm9hijg4t54t26b8.apps.googleusercontent.com',
  scopes: 'https://www.googleapis.com/auth/calendar',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

// Define window.gapi for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

export default function GoogleCalendarTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // Add log message
  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Load the Google API script
  useEffect(() => {
    const loadGoogleScript = () => {
      setIsLoading(true);
      addLog("Loading Google API script...");
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        addLog("Google API script loaded successfully");
        setIsApiLoaded(true);
        setIsLoading(false);
      };
      
      script.onerror = () => {
        addLog("Failed to load Google API script");
        setError("Failed to load Google API script");
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleScript();
  }, []);

  // Initialize Google API client
  const initializeClient = () => {
    setIsLoading(true);
    setError(null);
    addLog("Initializing Google API client...");
    
    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({
        apiKey: GOOGLE_CONFIG.apiKey,
        clientId: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        discoveryDocs: GOOGLE_CONFIG.discoveryDocs
      }).then(() => {
        addLog("Google API client initialized successfully");
        
        // Check if user is already signed in
        const isUserSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
        setIsSignedIn(isUserSignedIn);
        addLog(`User is signed in: ${isUserSignedIn}`);
        
        if (isUserSignedIn) {
          fetchEvents();
        }
        
        setIsLoading(false);
      }).catch((error: any) => {
        addLog(`Failed to initialize Google API client: ${error.message || error}`);
        setError(`Failed to initialize Google API client: ${error.message || error}`);
        setIsLoading(false);
      });
    });
  };

  // Sign in
  const handleSignIn = () => {
    setIsLoading(true);
    setError(null);
    addLog("Signing in to Google...");
    
    window.gapi.auth2.getAuthInstance().signIn()
      .then(() => {
        addLog("Sign in successful");
        setIsSignedIn(true);
        fetchEvents();
        setIsLoading(false);
      })
      .catch((error: any) => {
        addLog(`Sign in error: ${error.message || error}`);
        setError(`Sign in error: ${error.message || error}`);
        setIsLoading(false);
      });
  };

  // Sign out
  const handleSignOut = () => {
    setIsLoading(true);
    setError(null);
    addLog("Signing out...");
    
    window.gapi.auth2.getAuthInstance().signOut()
      .then(() => {
        addLog("Sign out successful");
        setIsSignedIn(false);
        setEvents([]);
        setIsLoading(false);
      })
      .catch((error: any) => {
        addLog(`Sign out error: ${error.message || error}`);
        setError(`Sign out error: ${error.message || error}`);
        setIsLoading(false);
      });
  };

  // Fetch events
  const fetchEvents = () => {
    setIsLoading(true);
    setError(null);
    addLog("Fetching calendar events...");
    
    const now = new Date();
    const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': now.toISOString(),
      'timeMax': oneMonthFromNow.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then((response: any) => {
      const events = response.result.items;
      addLog(`Fetched ${events.length} events`);
      setEvents(events);
      setIsLoading(false);
    }).catch((error: any) => {
      addLog(`Error fetching events: ${error.message || error}`);
      setError(`Error fetching events: ${error.message || error}`);
      setIsLoading(false);
    });
  };

  // Create a test event
  const createTestEvent = () => {
    setIsLoading(true);
    setError(null);
    addLog("Creating test event...");
    
    const event = {
      'summary': 'Test Event from TimeAI',
      'description': 'This is a test event created by TimeAI',
      'start': {
        'dateTime': new Date().toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    window.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    }).then(() => {
      addLog("Test event created successfully");
      fetchEvents();
    }).catch((error: any) => {
      addLog(`Error creating event: ${error.message || error}`);
      setError(`Error creating event: ${error.message || error}`);
      setIsLoading(false);
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Google Calendar Test</h1>
      
      {/* Status and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="space-y-2 mb-4">
          <p>API Loaded: <span className="font-medium">{isApiLoaded ? "Yes" : "No"}</span></p>
          <p>Signed In: <span className="font-medium">{isSignedIn ? "Yes" : "No"}</span></p>
          <p>Loading: <span className="font-medium">{isLoading ? "Yes" : "No"}</span></p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isApiLoaded && !isSignedIn && (
            <>
              <button 
                onClick={initializeClient}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Initialize Client
              </button>
              <button 
                onClick={handleSignIn}
                disabled={isLoading || !window.gapi?.auth2}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Sign In
              </button>
            </>
          )}
          
          {isSignedIn && (
            <>
              <button 
                onClick={fetchEvents}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Fetch Events
              </button>
              <button 
                onClick={createTestEvent}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Create Test Event
              </button>
              <button 
                onClick={handleSignOut}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Events */}
      {isSignedIn && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Calendar Events ({events.length})</h2>
          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="border rounded p-3">
                  <p className="font-medium">{event.summary}</p>
                  <p className="text-sm text-gray-500">
                    {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'All day'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No events found</p>
          )}
        </div>
      )}
      
      {/* Debug Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded h-60 overflow-y-auto font-mono text-sm">
          {log.map((entry, index) => (
            <div key={index} className="mb-1">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}