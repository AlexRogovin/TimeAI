// Initialize the Google API client
export const initGoogleApiClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error('Google API not loaded'));
      return;
    }
    
    console.log("Initializing Google API client...");
    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({
        apiKey: 'AIzaSyAIq-9g9nreVb_HGULo5oI-NA8TBNorIks',
        clientId: '133908799105-qt1r7ptinl87dfe5jm9hijg4t54t26b8.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
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