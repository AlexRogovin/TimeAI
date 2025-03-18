import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleCalendarEvent,
  addEvent,
  deleteEvent,
  getEvents,
  isSignedIn,
  loadGoogleApi,
  signIn,
  signOut,
  updateEvent,
} from '@/lib/google-calendar';
import { addDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface GoogleCalendarContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  events: GoogleCalendarEvent[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshEvents: (start?: Date, end?: Date) => Promise<void>;
  createEvent: (
    summary: string,
    description: string,
    start: Date,
    end: Date
  ) => Promise<GoogleCalendarEvent>;
  editEvent: (
    eventId: string,
    summary: string,
    description: string,
    start: Date,
    end: Date
  ) => Promise<GoogleCalendarEvent>;
  removeEvent: (eventId: string) => Promise<void>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(
  undefined
);

export const GoogleCalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initGoogleApi = async () => {
      try {
        await loadGoogleApi();
        setIsAuthenticated(isSignedIn());
        if (isSignedIn()) {
          await refreshEvents();
        }
      } catch (error) {
        console.error('Error initializing Google API:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize Google Calendar',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initGoogleApi();
  }, []);

  const refreshEvents = async (
    start: Date = new Date(),
    end: Date = addDays(new Date(), 30)
  ) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const calendarEvents = await getEvents(start, end);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch calendar events',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    try {
      await signIn();
      setIsAuthenticated(true);
      await refreshEvents();
      toast({
        title: 'Success',
        description: 'Successfully connected to Google Calendar',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign in to Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setIsAuthenticated(false);
      setEvents([]);
      toast({
        title: 'Success',
        description: 'Successfully disconnected from Google Calendar',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out from Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (
    summary: string,
    description: string,
    start: Date,
    end: Date
  ) => {
    setIsLoading(true);
    try {
      const newEvent = await addEvent(summary, description, start, end);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      toast({
        title: 'Success',
        description: 'Event added to Google Calendar',
      });
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add event to Google Calendar',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editEvent = async (
    eventId: string,
    summary: string,
    description: string,
    start: Date,
    end: Date
  ) => {
    setIsLoading(true);
    try {
      const updatedEvent = await updateEvent(
        eventId,
        summary,
        description,
        start,
        end
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? updatedEvent : event
        )
      );
      toast({
        title: 'Success',
        description: 'Event updated in Google Calendar',
      });
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event in Google Calendar',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      await deleteEvent(eventId);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      toast({
        title: 'Success',
        description: 'Event removed from Google Calendar',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove event from Google Calendar',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleCalendarContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        events,
        login,
        logout,
        refreshEvents,
        createEvent,
        editEvent,
        removeEvent,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  );
};

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (context === undefined) {
    throw new Error(
      'useGoogleCalendar must be used within a GoogleCalendarProvider'
    );
  }
  return context;
};