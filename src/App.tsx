import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">TimeAI</h1>
      </header>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<div>Calendar Page</div>} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <p>Welcome to TimeAI!</p>
    </div>
  );
}

export default App;