import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DebugLog } from "@/types/system";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DebugInfoPaneProps {
  logs: DebugLog[];
  onRefresh: () => void;
  isServiceRunning: boolean;
}

export function DebugInfoPane({ 
  logs, 
  onRefresh, 
  isServiceRunning
}: DebugInfoPaneProps) {
  const [isExpanded, setIsExpanded] = useState(!isServiceRunning);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={cn("transition-all duration-200", isExpanded ? "" : "")}>
      <CardHeader 
        className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Debug Output
          {!isServiceRunning && (
            <Badge variant="secondary" className="text-xs">
              Service Stopped
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {logs.length > 0 ? (
            <ScrollArea className="h-64 w-full border rounded-md">
              <div className="p-4 space-y-2">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-3 text-sm border-l-2 border-l-muted pl-3 py-1"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getLogIcon(log.level)}
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTime(log.timestamp)}
                      </span>
                      <Badge 
                        variant={getLogBadgeVariant(log.level)} 
                        className="text-xs px-1 py-0"
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs break-all">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No debug output available</p>
              <p className="text-sm mt-1">Logs will appear here when the service encounters issues</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}