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
            variant={image.reference?.includes('docker.io') ? 'outline' : 'secondary'}
            className="ml-2"
          >
            {image.reference?.includes('docker.io') ? 'Remote' : 'Local'}
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
                      <span>
                        {image.descriptor?.size ? 
                          `${Math.round(image.descriptor.size / 1024)} KB` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Media Type:</span>
                      <span>{image.descriptor?.mediaType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-mono text-xs break-all">{image.reference}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Digest</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <code className="text-xs font-mono break-all text-muted-foreground">
                      {image.descriptor?.digest || 'N/A'}
                    </code>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="layers" className="flex-1 m-0 p-4">
            <ScrollArea className="h-full">
              <p className="text-muted-foreground text-sm">
                Layer information is not available from the image list API. 
                Use the inspect command to view detailed layer information.
              </p>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 m-0 p-4">
            <ScrollArea className="h-full">
              <p className="text-muted-foreground text-sm">
                History information is not available from the image list API.
                Use the inspect command to view detailed history information.
              </p>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}