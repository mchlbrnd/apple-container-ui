import { useState } from "react";
import { SystemStatus, DNSEntry, DebugLog } from "@/types/system";
import { mockSystemStatus, mockDNSEntries, mockDebugLogs } from "@/data/mockSystem";
import { SystemStatusCard } from "@/components/system/SystemStatusCard";
import { DNSConfig } from "@/components/system/DNSConfig";
import { DebugInfoPane } from "@/components/system/DebugInfoPane";
import { useToast } from "@/hooks/use-toast";

export default function SystemPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus);
  const [dnsEntries, setDnsEntries] = useState<DNSEntry[]>(mockDNSEntries);
  const [debugLogs] = useState<DebugLog[]>(mockDebugLogs);
  const [selectedDNSId, setSelectedDNSId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStart = async () => {
    setIsLoading(true);
    // Simulate service start
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        isRunning: true,
        uptime: "0 minutes",
        lastStarted: new Date().toISOString()
      }));
      setIsLoading(false);
      toast({
        title: "Service started",
        description: "Docker service is now running",
      });
    }, 2000);
  };

  const handleStop = async () => {
    setIsLoading(true);
    // Simulate service stop
    setTimeout(() => {
      setSystemStatus(prev => ({
        ...prev,
        isRunning: false,
        uptime: "0 minutes",
        lastStopped: new Date().toISOString()
      }));
      setIsLoading(false);
      toast({
        title: "Service stopped",
        description: "Docker service has been stopped",
        variant: "destructive"
      });
    }, 1500);
  };

  const handleAddDNS = (hostname: string, ipAddress: string, type: 'A' | 'AAAA' | 'CNAME') => {
    const newEntry: DNSEntry = {
      id: `dns-${Date.now()}`,
      hostname,
      ipAddress,
      type,
      isDefault: dnsEntries.length === 0, // First entry becomes default
      createdAt: new Date().toISOString()
    };

    setDnsEntries(prev => [...prev, newEntry]);
    toast({
      title: "DNS entry added",
      description: `Added ${hostname} -> ${ipAddress}`,
    });
  };

  const handleRemoveDNS = (id: string) => {
    const entry = dnsEntries.find(e => e.id === id);
    if (entry) {
      setDnsEntries(prev => prev.filter(e => e.id !== id));
      setSelectedDNSId(null);
      toast({
        title: "DNS entry removed",
        description: `Removed ${entry.hostname}`,
        variant: "destructive"
      });
    }
  };

  const handleSetDefaultDNS = (id: string) => {
    const entry = dnsEntries.find(e => e.id === id);
    if (entry && !entry.isDefault) {
      setDnsEntries(prev => prev.map(e => ({
        ...e,
        isDefault: e.id === id
      })));
      toast({
        title: "Default DNS set",
        description: `${entry.hostname} is now the default DNS entry`,
      });
    }
  };

  const handleDNSClick = (entry: DNSEntry) => {
    setSelectedDNSId(entry.id);
  };

  const handleRefreshLogs = () => {
    toast({
      title: "Logs refreshed",
      description: "Debug output has been updated",
    });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6 overflow-auto">
      <SystemStatusCard
        status={systemStatus}
        onStart={handleStart}
        onStop={handleStop}
        isLoading={isLoading}
      />
      
      <DNSConfig
        entries={dnsEntries}
        onAdd={handleAddDNS}
        onRemove={handleRemoveDNS}
        onSetDefault={handleSetDefaultDNS}
        selectedEntryId={selectedDNSId}
        onEntryClick={handleDNSClick}
      />
      
      <DebugInfoPane
        logs={debugLogs}
        onRefresh={handleRefreshLogs}
        isServiceRunning={systemStatus.isRunning}
      />
    </div>
  );
}