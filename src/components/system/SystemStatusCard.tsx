import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/types/system";
import { Play, Square, Clock, Zap } from "lucide-react";

interface SystemStatusCardProps {
  status: SystemStatus;
  onStart: () => void;
  onStop: () => void;
  isLoading?: boolean;
}

export function SystemStatusCard({ 
  status, 
  onStart, 
  onStop, 
  isLoading = false
}: SystemStatusCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Docker Service</CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant={status.isRunning ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {status.isRunning ? (
              <>
                <Zap className="w-3 h-3" />
                Running
              </>
            ) : (
              <>
                <Square className="w-3 h-3" />
                Stopped
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-mono text-sm">{status.version}</p>
          </div>
          
          {status.isRunning && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Uptime
              </p>
              <p className="text-sm">{status.uptime}</p>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {status.isRunning ? "Started" : "Last Started"}
            </p>
            <p className="text-sm">{formatDate(status.lastStarted)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onStart}
            disabled={status.isRunning || isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
          
          <Button
            onClick={onStop}
            disabled={!status.isRunning || isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}