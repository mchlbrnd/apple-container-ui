import { useState, useMemo } from "react";
import { DockerImage } from "@/types/image";
import { ImageToolbar } from "@/components/images/ImageToolbar";
import { ImageTable } from "@/components/images/ImageTable";
import { ImageDetail } from "@/components/images/ImageDetail";
import { PullImageDialog } from "@/components/images/PullImageDialog";
import { BuildImageDialog } from "@/components/images/BuildImageDialog";
import { TagImageDialog } from "@/components/images/TagImageDialog";
import { useImages } from "@/hooks/useImages";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ImagesPage() {
  const { images, loading, pullImage, buildImage, tagImage, pushImage, deleteImage, pruneImages } = useImages();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pullDialogOpen, setPullDialogOpen] = useState(false);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images;
    
    return images.filter(image =>
      image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, searchQuery]);

  const handleSelectImage = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedImages(selected ? filteredImages.map(img => img.id) : []);
  };

  const handleImageClick = (image: DockerImage) => {
    setSelectedImage(image);
  };

  const handlePull = async (registry: string, username?: string, password?: string) => {
    try {
      await pullImage(registry, username, password);
      setPullDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleBuild = async (contextPath: string, dockerfilePath: string, tag: string) => {
    try {
      await buildImage(contextPath, dockerfilePath, tag);
      setBuildDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleTag = () => {
    if (selectedImages.length === 1) {
      setTagDialogOpen(true);
    }
  };

  const handleTagSubmit = async (newTag: string) => {
    if (selectedImages.length === 1) {
      const selectedImage = images.find(img => img.id === selectedImages[0]);
      if (selectedImage) {
        try {
          await tagImage(`${selectedImage.name}:${selectedImage.tag}`, newTag);
          setTagDialogOpen(false);
        } catch (error) {
          // Error is handled in the hook
        }
      }
    }
  };

  const handlePush = async () => {
    try {
      for (const imageId of selectedImages) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          await pushImage(`${image.name}:${image.tag}`);
        }
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = () => {
    if (selectedImages.length > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      for (const imageId of selectedImages) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          await deleteImage(`${image.name}:${image.tag}`);
        }
      }
      setSelectedImages([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handlePrune = async () => {
    try {
      await pruneImages();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ImageToolbar
        onPull={() => setPullDialogOpen(true)}
        onBuild={() => setBuildDialogOpen(true)}
        onTag={handleTag}
        onPush={handlePush}
        onDelete={handleDelete}
        onPrune={handlePrune}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedImages.length}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ImageTable
            images={filteredImages}
            selectedImages={selectedImages}
            onSelectImage={handleSelectImage}
            onSelectAll={handleSelectAll}
            selectedImage={selectedImage}
            onImageClick={handleImageClick}
          />
        </div>
        
        <ImageDetail image={selectedImage} />
      </div>

      <PullImageDialog
        open={pullDialogOpen}
        onOpenChange={setPullDialogOpen}
        onPull={handlePull}
      />

      <BuildImageDialog
        open={buildDialogOpen}
        onOpenChange={setBuildDialogOpen}
        onBuild={handleBuild}
      />

      <TagImageDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        onTag={handleTagSubmit}
        currentTag={selectedImages.length === 1 ? 
          (() => {
            const image = images.find(img => img.id === selectedImages[0]);
            return image ? `${image.name}:${image.tag}` : '';
          })() : ''
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Images</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedImages.length} image(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}