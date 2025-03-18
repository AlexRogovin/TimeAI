// Direct implementation for Google Calendar integration

// Load the Google API client library
export const loadGoogleApiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
      if (window.gapi) {
        resolve();
        return;
      }
    }

    console.log("Loading Google API script...");
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google API script loaded successfully");
      resolve();
    };
    script.onerror = (error) => {
      console.error("Failed to load Google API script:", error);
      reject(new Error('Failed to load Google API script'));
    };
    document.body.appendChild(script);
  });
};

// Initialize the Google API client
export const initGoogleApiClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log("Initializing Google API client...");
    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({
        apiKey: 'AIzaSyAIq-9g9nreVb_HGULo5oI-NA8TBNorIks',
        clientId: '133908799105-qt1r7ptinl87dfe5jm9hijg4t54t26b8.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
      }).then(() => {
        console.log("Google API client initialized successfully");
        resolve();
      }).catch((error: any) => {
        console.error("Failed to initialize Google API client:", error);
        reject(error);
      });
    });
  });
};

// Check if user is signed in
export const checkSignInStatus = (): boolean => {
  if (!window.gapi || !window.gapi.auth2) {
    console.warn("Google API not initialized yet");
    return false;
  }
  const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
  console.log("User is signed in:", isSignedIn);
  return isSignedIn;
};

// Sign in the user
export const signInUser = async (): Promise<void> => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error("Google API not initialized yet");
  }
  
  console.log("Attempting to sign in user...");
  try {
    const googleUser = await window.gapi.auth2.getAuthInstance().signIn({
      prompt: 'select_account'
    });
    console.log("User signed in successfully:", googleUser);
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign out the user
export const signOutUser = async (): Promise<void> => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error("Google API not initialized yet");
  }
  
  console.log("Attempting to sign out user...");
  try {
    await window.gapi.auth2.getAuthInstance().signOut();
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get events from Google Calendar
export const fetchCalendarEvents = async (
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
): Promise<any[]> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error("Google API not initialized yet");
  }
  
  if (!checkSignInStatus()) {
    throw new Error("User not signed in");
  }
  
  console.log(`Fetching calendar events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);
  try {
    const response = await window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin.toISOString(),
      'timeMax': timeMax.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'orderBy': 'startTime'
    });
    
    console.log("Calendar events fetched successfully:", response.result.items);
    return response.result.items;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
};

// Create a new event in Google Calendar
export const createCalendarEvent = async (
  summary: string,
  description: string,
  start: Date,
  end: Date
): Promise<any> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error("Google API not initialized yet");
  }
  
  if (!checkSignInStatus()) {
    throw new Error("User not signed in");
  }
  
  const event = {
    'summary': summary,
    'description': description,
    'start': {
      'dateTime': start.toISOString(),
      'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    'end': {
      'dateTime': end.toISOString(),
      'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };
  
  console.log("Creating calendar event:", event);
  try {
    const response = await window.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });
    
    console.log("Calendar event created successfully:", response.result);
    return response.result;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
};