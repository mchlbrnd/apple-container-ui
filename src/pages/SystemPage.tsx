export default function SystemPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-card p-4">
        <h1 className="text-xl font-semibold">System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          System configuration and status
        </p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>System view coming soon</p>
        </div>
      </div>
    </div>
  );
}