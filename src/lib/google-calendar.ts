// Google Calendar API integration

// Define window.gapi for TypeScript
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Configuration
const GOOGLE_CONFIG = {
  apiKey: 'AIzaSyAIq-9g9nreVb_HGULo5oI-NA8TBNorIks',
  clientId: '133908799105-qt1r7ptinl87dfe5jm9hijg4t54t26b8.apps.googleusercontent.com',
  scopes: 'https://www.googleapis.com/auth/calendar',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

// Load the Google API script
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector('script#google-api')) {
      if (window.gapi) {
        resolve();
        return;
      }
    }

    console.log('Loading Google API script...');
    const script = document.createElement('script');
    script.id = 'google-api';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google API script loaded successfully');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google API script:', error);
      reject(new Error('Failed to load Google API script'));
    };
    
    document.head.appendChild(script);
  });
};

// Initialize the Google API client
export const initializeGoogleClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('Google API not loaded'));
      return;
    }
    
    console.log('Loading Google API client...');
    window.gapi.load('client:auth2', () => {
      console.log('Initializing Google API client...');
      window.gapi.client.init({
        apiKey: GOOGLE_CONFIG.apiKey,
        clientId: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        discoveryDocs: GOOGLE_CONFIG.discoveryDocs
      }).then(() => {
        console.log('Google API client initialized successfully');
        resolve();
      }).catch((error: any) => {
        console.error('Failed to initialize Google API client:', error);
        reject(error);
      });
    });
  });
};

// Check if user is signed in
export const isUserSignedIn = (): boolean => {
  if (!window.gapi || !window.gapi.auth2) {
    console.warn('Google API not initialized yet');
    return false;
  }
  
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const isSignedIn = authInstance.isSignedIn.get();
    console.log('User is signed in:', isSignedIn);
    return isSignedIn;
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

// Sign in the user
export const signInToGoogle = async (): Promise<any> => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error('Google API not initialized yet');
  }
  
  console.log('Attempting to sign in user...');
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn({
      prompt: 'select_account'
    });
    console.log('User signed in successfully');
    return user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // Provide more specific error messages
    if (error.error === 'popup_blocked_by_browser') {
      throw new Error('Sign-in popup was blocked. Please allow popups for this site and try again.');
    } else if (error.error === 'access_denied') {
      throw new Error('You denied access to your Google account. Please try again and allow access.');
    } else {
      throw error;
    }
  }
};

// Sign out the user
export const signOutFromGoogle = async (): Promise<void> => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error('Google API not initialized yet');
  }
  
  console.log('Attempting to sign out user...');
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get the user's calendar events
export const getCalendarEvents = async (
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
): Promise<any[]> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API not initialized yet');
  }
  
  if (!isUserSignedIn()) {
    throw new Error('User not signed in');
  }
  
  console.log(`Fetching calendar events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);
  try {
    const response = await window.gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin.toISOString(),
      'timeMax': timeMax.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 50,
      'orderBy': 'startTime'
    });
    
    console.log('Calendar events fetched successfully:', response.result.items);
    return response.result.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

// Create a new calendar event
export const createCalendarEvent = async (
  summary: string,
  description: string,
  start: Date,
  end: Date
): Promise<any> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API not initialized yet');
  }
  
  if (!isUserSignedIn()) {
    throw new Error('User not signed in');
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
  
  console.log('Creating calendar event:', event);
  try {
    const response = await window.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });
    
    console.log('Calendar event created successfully:', response.result);
    return response.result;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update an existing calendar event
export const updateCalendarEvent = async (
  eventId: string,
  summary: string,
  description: string,
  start: Date,
  end: Date
): Promise<any> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API not initialized yet');
  }
  
  if (!isUserSignedIn()) {
    throw new Error('User not signed in');
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
  
  console.log('Updating calendar event:', eventId, event);
  try {
    const response = await window.gapi.client.calendar.events.update({
      'calendarId': 'primary',
      'eventId': eventId,
      'resource': event
    });
    
    console.log('Calendar event updated successfully:', response.result);
    return response.result;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Delete a calendar event
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API not initialized yet');
  }
  
  if (!isUserSignedIn()) {
    throw new Error('User not signed in');
  }
  
  console.log('Deleting calendar event:', eventId);
  try {
    await window.gapi.client.calendar.events.delete({
      'calendarId': 'primary',
      'eventId': eventId
    });
    
    console.log('Calendar event deleted successfully');
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// Get user profile information
export const getUserProfile = (): any => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error('Google API not initialized yet');
  }
  
  if (!isUserSignedIn()) {
    throw new Error('User not signed in');
  }
  
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};