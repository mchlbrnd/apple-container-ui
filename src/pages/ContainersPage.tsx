import { useState, useMemo } from "react";
import { ContainerToolbar } from "@/components/containers/ContainerToolbar";
import { ContainerTable } from "@/components/containers/ContainerTable";
import { ContainerDetail } from "@/components/containers/ContainerDetail";
import { Container } from "@/types/container";
import { useContainers } from "@/hooks/useContainers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ContainersPage() {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | undefined>();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { containers, loading, error, refresh, startContainer, stopContainer, deleteContainer, restartContainer, killContainer, runContainer } = useContainers();

  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      const matchesSearch = 
        container.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        container.image.toLowerCase().includes(searchValue.toLowerCase()) ||
        container.id.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || container.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [containers, searchValue, statusFilter]);

  const handleContainerSelect = (container: Container) => {
    setSelectedContainer(container);
  };

  const handleRun = () => {
    // This would open a run container dialog
    console.log("Run new container");
  };

  const handleStart = async () => {
    for (const containerId of selectedContainers) {
      await startContainer(containerId);
    }
    setSelectedContainers([]);
  };

  const handleStop = async () => {
    for (const containerId of selectedContainers) {
      await stopContainer(containerId);
    }
    setSelectedContainers([]);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    for (const containerId of selectedContainers) {
      await deleteContainer(containerId);
    }
    setSelectedContainers([]);
    setDeleteDialogOpen(false);
  };

  const handleInspect = () => {
    if (selectedContainers.length > 0) {
      const container = containers.find(c => c.id === selectedContainers[0]);
      if (container) {
        setSelectedContainer(container);
      }
    }
  };

  const handleLogs = () => {
    // This would open a logs dialog
    console.log("View logs:", selectedContainers[0]);
  };

  const handleRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading containers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
            <ContainerDetail 
              container={selectedContainer}
              onStart={startContainer}
              onStop={stopContainer}
              onRestart={restartContainer}
              onDelete={deleteContainer}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Select a container to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Containers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedContainers.length} container(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}