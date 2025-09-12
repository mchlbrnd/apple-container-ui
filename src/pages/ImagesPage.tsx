import { useState, useMemo } from "react";
import { DockerImage } from "@/types/image";
import { mockImages } from "@/data/mockImages";
import { ImageToolbar } from "@/components/images/ImageToolbar";
import { ImageTable } from "@/components/images/ImageTable";
import { ImageDetail } from "@/components/images/ImageDetail";
import { PullImageDialog } from "@/components/images/PullImageDialog";
import { BuildImageDialog } from "@/components/images/BuildImageDialog";
import { useToast } from "@/hooks/use-toast";

export default function ImagesPage() {
  const [images] = useState<DockerImage[]>(mockImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<DockerImage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pullDialogOpen, setPullDialogOpen] = useState(false);
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handlePull = (registry: string, username?: string, password?: string) => {
    toast({
      title: "Pulling image",
      description: `Starting pull for ${registry}`,
    });
    console.log("Pull image:", { registry, username, password });
  };

  const handleBuild = (contextPath: string, dockerfilePath: string, tag: string) => {
    toast({
      title: "Building image",
      description: `Building ${tag} from ${contextPath}`,
    });
    console.log("Build image:", { contextPath, dockerfilePath, tag });
  };

  const handleTag = () => {
    toast({
      title: "Tag image",
      description: `Tagging ${selectedImages.length} image(s)`,
    });
  };

  const handlePush = () => {
    toast({
      title: "Push images",
      description: `Pushing ${selectedImages.length} image(s)`,
    });
  };

  const handleDelete = () => {
    toast({
      title: "Delete images",
      description: `Deleting ${selectedImages.length} image(s)`,
      variant: "destructive"
    });
  };

  const handlePrune = () => {
    toast({
      title: "Prune images",
      description: "Removing unused images",
    });
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
    </div>
  );
}