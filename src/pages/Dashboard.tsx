export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Tasks Completed</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Upcoming Tasks</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Focus Time</h2>
          <p className="text-2xl font-bold">0h</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
          <h2 className="font-semibold mb-2">AI Suggestions</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}