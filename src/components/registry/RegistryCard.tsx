import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Registry } from "@/types/registry";
import { CheckCircle, XCircle, Star, Globe, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistryCardProps {
  registry: Registry | null;
}

export function RegistryCard({ registry }: RegistryCardProps) {
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

  if (!registry) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5" />
            No Registry Configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure a default registry to manage container images.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {registry.name}
          </div>
          <div className="flex items-center gap-2">
            {registry.isDefault && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <Badge variant="secondary" className="text-xs">
                  Default
                </Badge>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              Registry URL
            </div>
            <div className="font-mono text-sm bg-muted p-2 rounded">
              {registry.url}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              Username
            </div>
            <div className="text-sm">
              {registry.username || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Status
            </div>
            <div className="flex items-center gap-2">
              {registry.isLoggedIn ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Logged in</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Not logged in</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last Login
            </div>
            <div className="text-sm">
              {formatLastLogin(registry.lastLogin)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}