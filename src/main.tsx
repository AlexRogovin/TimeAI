import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/layout/theme-provider";
import "./index.css";
import { AppRoutes } from "./routes";
import { FineProvider } from "./hooks/use-fine";
import { GoogleCalendarProvider } from "./contexts/google-calendar-context";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <FineProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <GoogleCalendarProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Sonner />
            <Toaster />
          </GoogleCalendarProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </FineProvider>
);