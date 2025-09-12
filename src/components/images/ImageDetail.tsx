import { DockerImage } from "@/types/image";
import { Badge } from "@/components/ui/badge";  
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ImageDetailProps {
  image: DockerImage | null;
}

export function ImageDetail({ image }: ImageDetailProps) {
  if (!image) {
    return (
      <div className="w-80 border-l border-border bg-card p-6">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Select an image to view details</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{image.name}:{image.tag}</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {image.id.substring(0, 16)}...
            </p>
          </div>
          <Badge 
            variant={image.registry === 'local' ? 'secondary' : 'outline'}
            className="ml-2"
          >
            {image.registry}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="inspect" className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="inspect" className="rounded-none">Inspect</TabsTrigger>
            <TabsTrigger value="layers" className="rounded-none">Layers</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inspect" className="flex-1 m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(image.created)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Architecture:</span>
                      <span>{image.architecture || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">OS:</span>
                      <span>{image.os || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Digest</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <code className="text-xs font-mono break-all text-muted-foreground">
                      {image.digest}
                    </code>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="layers" className="flex-1 m-0 p-4">
            <ScrollArea className="h-full">
              {image.layers ? (
                <div className="space-y-2">
                  {image.layers.map((layer, index) => (
                    <Card key={layer.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {layer.id.substring(0, 12)}...
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {layer.size}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono break-all">
                          {layer.command}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No layer information available</p>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 m-0 p-4">
            <ScrollArea className="h-full">
              {image.history ? (
                <div className="space-y-2">
                  {image.history.map((entry, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.created)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {entry.size}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono break-all">
                          {entry.createdBy}
                        </p>
                        {entry.comment && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No history information available</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}