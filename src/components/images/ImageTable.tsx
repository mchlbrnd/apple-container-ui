import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DockerImage } from "@/types/image";
import { cn } from "@/lib/utils";

interface ImageTableProps {
  images: DockerImage[];
  selectedImages: string[];
  onSelectImage: (imageId: string) => void;
  onSelectAll: (selected: boolean) => void;
  selectedImage: DockerImage | null;
  onImageClick: (image: DockerImage) => void;
}

export function ImageTable({
  images,
  selectedImages,
  onSelectImage,
  onSelectAll,
  selectedImage,
  onImageClick
}: ImageTableProps) {
  const isAllSelected = images.length > 0 && selectedImages.length === images.length;
  const isIndeterminate = selectedImages.length > 0 && selectedImages.length < images.length;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                ref={(el) => {
                  if (el) {
                    const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
                    if (input) input.indeterminate = isIndeterminate;
                  }
                }}
              />
            </TableHead>
            <TableHead className="font-medium">Name:Tag</TableHead>
            <TableHead className="font-medium">ID/Digest</TableHead>
            <TableHead className="font-medium">Size</TableHead>
            <TableHead className="font-medium">Created</TableHead>
            <TableHead className="font-medium">Registry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow
              key={image.id}
              className={cn(
                "cursor-pointer",
                selectedImage?.id === image.id && "bg-accent"
              )}
              onClick={() => onImageClick(image)}
            >
              <TableCell>
                <Checkbox
                  checked={selectedImages.includes(image.id)}
                  onCheckedChange={() => onSelectImage(image.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{image.name}</span>
                  <span className="text-xs text-muted-foreground">{image.tag}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-mono text-xs">
                  {image.digest.substring(0, 20)}...
                </div>
              </TableCell>
              <TableCell>{image.size}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(image.created)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={image.registry === 'local' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {image.registry}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {images.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No images found</p>
        </div>
      )}
    </div>
  );
}