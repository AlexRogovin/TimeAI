import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import Dashboard from "./pages";
import CalendarPage from "./pages/calendar";
import SettingsPage from "./pages/settings";

export function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}