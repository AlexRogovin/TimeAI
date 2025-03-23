export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
        <h2 className="font-semibold mb-4">Google Calendar Integration</h2>
        <p>Google Calendar integration will be implemented here.</p>
        <button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
          Connect to Google Calendar
        </button>
      </div>
    </div>
  );
}