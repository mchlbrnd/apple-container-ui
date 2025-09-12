import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Container } from "@/types/container";
import { Play, Square, Pause, RotateCcw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ContainerApi, ContainerApiError } from "@/services/containerApi";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ContainerDetailProps {
  container: Container;
  onStart?: (containerId: string) => void;
  onStop?: (containerId: string) => void;
  onRestart?: (containerId: string) => void;
  onPause?: (containerId: string) => void;
  onDelete?: (containerId: string) => void;
}

const statusColors = {
  running: "bg-success text-success-foreground",
  stopped: "bg-muted text-muted-foreground", 
  paused: "bg-warning text-warning-foreground",
  restarting: "bg-primary text-primary-foreground",
  removing: "bg-destructive text-destructive-foreground",
  created: "bg-accent text-accent-foreground",
};

// Mock data for detailed view
const mockInspectData = {
  Config: {
    Hostname: "webapp-01",
    ExposedPorts: { "80/tcp": {}, "443/tcp": {} },
    Env: [
      "NODE_ENV=production",
      "PORT=3000",
      "DATABASE_URL=postgresql://localhost:5432/app"
    ],
    Cmd: ["npm", "start"],
    WorkingDir: "/app"
  },
  NetworkSettings: {
    IPAddress: "172.17.0.2",
    MacAddress: "02:42:ac:11:00:02",
    Ports: {
      "3000/tcp": [{ HostIp: "0.0.0.0", HostPort: "3000" }]
    }
  },
  State: {
    StartedAt: "2024-01-15T10:30:00Z",
    FinishedAt: "0001-01-01T00:00:00Z",
    ExitCode: 0
  }
};

const mockLogs = `2024-01-15T10:30:15Z [INFO] Starting application server
2024-01-15T10:30:16Z [INFO] Connected to database
2024-01-15T10:30:16Z [INFO] Server listening on port 3000
2024-01-15T10:32:45Z [INFO] Processing request GET /api/users
2024-01-15T10:32:45Z [DEBUG] Query executed in 12ms
2024-01-15T10:32:45Z [INFO] Response sent: 200 OK
2024-01-15T10:33:12Z [INFO] Processing request POST /api/login
2024-01-15T10:33:12Z [INFO] User authentication successful
2024-01-15T10:33:12Z [INFO] Response sent: 200 OK`;

export function ContainerDetail({ 
  container, 
  onStart, 
  onStop, 
  onRestart, 
  onPause, 
  onDelete 
}: ContainerDetailProps) {
  const [inspectData, setInspectData] = useState<any>(null);
  const [logs, setLogs] = useState<string>("");
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [followingLogs, setFollowingLogs] = useState(false);
  const [logRunId, setLogRunId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (container) {
      loadInspectData();
    }
  }, [container]);

  const loadInspectData = async () => {
    try {
      setLoadingInspect(true);
      const data = await ContainerApi.inspectContainer(container.id);
      setInspectData(data);
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to inspect container';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingInspect(false);
    }
  };

  const loadLogs = async (follow = false) => {
    try {
      setLoadingLogs(true);
      const result = await ContainerApi.getContainerLogs(container.id, follow);
      
      if (follow && result.runId) {
        setFollowingLogs(true);
        setLogRunId(result.runId);
        
        // Set up log streaming handlers
        const unsubscribeStdout = window.api?.onSpawnStdout?.((data) => {
          setLogs(prev => prev + data);
        });
        
        const unsubscribeStderr = window.api?.onSpawnStderr?.((data) => {
          setLogs(prev => prev + data);
        });
        
        const unsubscribeClose = window.api?.onSpawnClose?.(() => {
          setFollowingLogs(false);
          setLogRunId(null);
          unsubscribeStdout?.();
          unsubscribeStderr?.();
          unsubscribeClose?.();
        });
        
      } else if (result.logs) {
        setLogs(result.logs);
      }
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to load logs';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const stopFollowingLogs = async () => {
    if (logRunId && window.api?.kill) {
      try {
        await window.api.kill(logRunId);
        setFollowingLogs(false);
        setLogRunId(null);
      } catch (err) {
        console.error('Failed to stop log following:', err);
      }
    }
  };

  const [execInput, setExecInput] = useState<string>("");
  const [execOutput, setExecOutput] = useState<string>("");
  const [execRunning, setExecRunning] = useState(false);

  const startExec = async () => {
    if (!execInput.trim()) return;
    
    try {
      setExecRunning(true);
      setExecOutput(prev => prev + `$ ${execInput}\n`);
      
      const runId = await ContainerApi.execInContainer(container.id, execInput);
      
      // Set up exec output handlers
      const unsubscribeStdout = window.api?.onSpawnStdout?.((data) => {
        setExecOutput(prev => prev + data);
      });
      
      const unsubscribeStderr = window.api?.onSpawnStderr?.((data) => {
        setExecOutput(prev => prev + data);
      });
      
      const unsubscribeClose = window.api?.onSpawnClose?.(() => {
        setExecRunning(false);
        unsubscribeStdout?.();
        unsubscribeStderr?.();
        unsubscribeClose?.();
      });
      
    } catch (err) {
      const message = err instanceof ContainerApiError ? err.message : 'Failed to execute command';
      setExecOutput(prev => prev + `Error: ${message}\n`);
      setExecRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs("");
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{container.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">
              {container.id}
            </p>
          </div>
          <Badge className={statusColors[container.status]}>
            {container.status}
          </Badge>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          {container.status === 'stopped' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={() => onStart?.(container.id)}
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          )}
          {container.status === 'running' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => onStop?.(container.id)}
              >
                <Square className="h-3 w-3" />
                Stop
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => onPause?.(container.id)}
              >
                <Pause className="h-3 w-3" />
                Pause
              </Button>
            </>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2"
            onClick={() => onRestart?.(container.id)}
          >
            <RotateCcw className="h-3 w-3" />
            Restart
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete?.(container.id)}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="summary" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="inspect">Inspect</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="exec">Exec</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 mt-4">
            <TabsContent value="summary" className="h-full">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Container Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Image</div>
                        <div className="font-medium">{container.image}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="font-medium">{container.status}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Network</div>
                        <div className="font-medium">
                          {container.networks?.[0]?.network || "default"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ports</div>
                        <div className="font-medium">
                          {container.ports.length > 0 ? container.ports.join(", ") : "None"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {container.configuration?.resources && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Resource Limits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">CPU</div>
                          <div className="font-medium">{container.configuration.resources.cpus} cores</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Memory</div>
                          <div className="font-medium">
                            {Math.round(container.configuration.resources.memoryInBytes / 1024 / 1024)} MB
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="inspect" className="h-full">
              <ScrollArea className="h-96 w-full rounded-md border p-4">
                {loadingInspect ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">Loading inspect data...</p>
                  </div>
                ) : inspectData ? (
                  <pre className="text-xs font-mono">
                    {JSON.stringify(inspectData, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">No inspect data available</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="logs" className="h-full">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {followingLogs ? (
                    <Button size="sm" variant="outline" onClick={stopFollowingLogs}>
                      Stop Following
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => loadLogs(false)}
                        disabled={loadingLogs}
                      >
                        Load Logs
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => loadLogs(true)}
                        disabled={loadingLogs}
                      >
                        Follow
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={clearLogs}>
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-80 w-full rounded-md border p-4 bg-muted">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {logs || "No logs available. Click 'Load Logs' to fetch container logs."}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="exec" className="h-full">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Execute commands in the container
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter command (e.g., /bin/bash, ls -la)"
                    value={execInput}
                    onChange={(e) => setExecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !execRunning) {
                        startExec();
                      }
                    }}
                    disabled={execRunning}
                  />
                  <Button 
                    onClick={startExec} 
                    disabled={execRunning || !execInput.trim()}
                    size="sm"
                  >
                    Execute
                  </Button>
                  <Button 
                    onClick={() => setExecOutput("")} 
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-80 w-full rounded-md border p-4 bg-muted">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {execOutput || "Enter a command above to execute in the container"}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}