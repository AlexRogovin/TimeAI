interface Window {
  gapi: {
    load: (
      apiName: string,
      callback: () => void
    ) => void;
    client: {
      init: (config: {
        apiKey: string;
        clientId: string;
        discoveryDocs: string[];
        scope: string;
      }) => Promise<void>;
      calendar: {
        events: {
          list: (params: {
            calendarId: string;
            timeMin: string;
            timeMax: string;
            showDeleted: boolean;
            singleEvents: boolean;
            orderBy: string;
          }) => Promise<{
            result: {
              items: any[];
            };
          }>;
          insert: (params: {
            calendarId: string;
            resource: any;
          }) => Promise<{
            result: any;
          }>;
          update: (params: {
            calendarId: string;
            eventId: string;
            resource: any;
          }) => Promise<{
            result: any;
          }>;
          delete: (params: {
            calendarId: string;
            eventId: string;
          }) => Promise<void>;
        };
      };
    };
    auth2: {
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
        };
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
    };
  };
}