import { useState, useMemo } from "react";
import { ContainerToolbar } from "@/components/containers/ContainerToolbar";
import { ContainerTable } from "@/components/containers/ContainerTable";
import { ContainerDetail } from "@/components/containers/ContainerDetail";
import { mockContainers } from "@/data/mockContainers";
import { Container } from "@/types/container";

export default function ContainersPage() {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | undefined>();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredContainers = useMemo(() => {
    return mockContainers.filter((container) => {
      const matchesSearch = 
        container.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        container.image.toLowerCase().includes(searchValue.toLowerCase()) ||
        container.id.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || container.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusFilter]);

  const handleContainerSelect = (container: Container) => {
    setSelectedContainer(container);
  };

  const handleRun = () => {
    console.log("Run new container");
  };

  const handleStart = () => {
    console.log("Start containers:", selectedContainers);
  };

  const handleStop = () => {
    console.log("Stop containers:", selectedContainers);
  };

  const handleDelete = () => {
    console.log("Delete containers:", selectedContainers);
  };

  const handleInspect = () => {
    console.log("Inspect container:", selectedContainers[0]);
  };

  const handleLogs = () => {
    console.log("View logs:", selectedContainers[0]);
  };

  const handleRefresh = () => {
    console.log("Refresh containers");
  };

  return (
    <div className="h-full flex">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col border-r border-border">
        <ContainerToolbar
          onRun={handleRun}
          onStart={handleStart}
          onStop={handleStop}
          onDelete={handleDelete}
          onInspect={handleInspect}
          onLogs={handleLogs}
          onRefresh={handleRefresh}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedCount={selectedContainers.length}
        />
        
        <div className="flex-1 p-4">
          <ContainerTable
            containers={filteredContainers}
            selectedContainers={selectedContainers}
            onSelectionChange={setSelectedContainers}
            onContainerSelect={handleContainerSelect}
            selectedContainer={selectedContainer}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-card">
        {selectedContainer ? (
          <ContainerDetail container={selectedContainer} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Select a container to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}