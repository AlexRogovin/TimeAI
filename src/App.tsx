import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/Calendar";
import SettingsPage from "./pages/Settings";
import Layout from "./components/Layout";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="timeai-theme">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;