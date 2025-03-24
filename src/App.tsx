import { Routes, Route, Link } from "react-router-dom";
import GoogleCalendarTest from "./pages/GoogleCalendarTest";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TimeAI</h1>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-blue-500">Home</Link>
            <Link to="/google-calendar-test" className="hover:text-blue-500">Google Calendar Test</Link>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/google-calendar-test" element={<GoogleCalendarTest />} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-semibold mb-4">Welcome to TimeAI</h2>
      <p className="mb-4">This is a smart time management app with AI capabilities.</p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
        <p className="mb-4">Click on "Google Calendar Test" in the navigation to test the Google Calendar integration.</p>
        <Link 
          to="/google-calendar-test" 
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Google Calendar Test
        </Link>
      </div>
    </div>
  );
}

export default App;