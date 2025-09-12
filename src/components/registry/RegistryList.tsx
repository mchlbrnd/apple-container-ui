import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Registry } from "@/types/registry";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Star } from "lucide-react";

interface RegistryListProps {
  registries: Registry[];
  selectedRegistryId: string | null;
  onRegistryClick: (registry: Registry) => void;
}

export function RegistryList({
  registries,
  selectedRegistryId,
  onRegistryClick
}: RegistryListProps) {
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Registry</TableHead>
            <TableHead className="font-medium">URL</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Username</TableHead>
            <TableHead className="font-medium">Last Login</TableHead>
            <TableHead className="font-medium">Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registries.map((registry) => (
            <TableRow
              key={registry.id}
              className={cn(
                "cursor-pointer",
                selectedRegistryId === registry.id && "bg-accent"
              )}
              onClick={() => onRegistryClick(registry)}
            >
              <TableCell className="font-medium">
                {registry.name}
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {registry.url}
              </TableCell>
              <TableCell>
                {registry.isLoggedIn ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Logged in</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Not logged in</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {registry.username || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatLastLogin(registry.lastLogin)}
              </TableCell>
              <TableCell>
                {registry.isDefault && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {registries.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No registries configured</p>
        </div>
      )}
    </div>
  );
}