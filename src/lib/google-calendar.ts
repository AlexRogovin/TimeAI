// Google Calendar API configuration
export const GOOGLE_API_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scope: 'https://www.googleapis.com/auth/calendar',
};

// Interface for Google Calendar events
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  colorId?: string;
}

// Load the Google API client library
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client
          .init({
            apiKey: GOOGLE_API_CONFIG.apiKey,
            clientId: GOOGLE_API_CONFIG.clientId,
            discoveryDocs: GOOGLE_API_CONFIG.discoveryDocs,
            scope: GOOGLE_API_CONFIG.scope,
          })
          .then(() => {
            console.log('Google API initialized successfully');
            resolve();
          })
          .catch((error: Error) => {
            console.error('Error initializing Google API:', error);
            reject(error);
          });
      });
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google API script'));
    };
    document.body.appendChild(script);
  });
};

// Check if user is signed in
export const isSignedIn = (): boolean => {
  if (!window.gapi || !window.gapi.auth2) return false;
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
};

// Sign in to Google
export const signIn = (): Promise<void> => {
  return window.gapi.auth2.getAuthInstance().signIn();
};

// Sign out from Google
export const signOut = (): Promise<void> => {
  return window.gapi.auth2.getAuthInstance().signOut();
};

// Get user's Google Calendar events
export const getEvents = async (
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> => {
  if (!isSignedIn()) {
    throw new Error('User not signed in');
  }

  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.result.items;
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

// Add an event to Google Calendar
export const addEvent = async (
  summary: string,
  description: string,
  start: Date,
  end: Date
): Promise<GoogleCalendarEvent> => {
  if (!isSignedIn()) {
    throw new Error('User not signed in');
  }

  const event = {
    summary,
    description,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.result;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    throw error;
  }
};

// Update an event in Google Calendar
export const updateEvent = async (
  eventId: string,
  summary: string,
  description: string,
  start: Date,
  end: Date
): Promise<GoogleCalendarEvent> => {
  if (!isSignedIn()) {
    throw new Error('User not signed in');
  }

  const event = {
    summary,
    description,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const response = await window.gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: event,
    });

    return response.result;
  } catch (error) {
    console.error('Error updating event in Google Calendar:', error);
    throw error;
  }
};

// Delete an event from Google Calendar
export const deleteEvent = async (eventId: string): Promise<void> => {
  if (!isSignedIn()) {
    throw new Error('User not signed in');
  }

  try {
    await window.gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error) {
    console.error('Error deleting event from Google Calendar:', error);
    throw error;
  }
};