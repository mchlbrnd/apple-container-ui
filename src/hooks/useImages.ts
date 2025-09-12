import { useState, useEffect } from 'react';
import { DockerImage } from '@/types/image';
import { ImageApi, ImageApiError } from '@/services/imageApi';
import { useToast } from '@/hooks/use-toast';

export function useImages() {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const imageList = await ImageApi.listImages();
      setImages(imageList);
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to load images';
      setError(message);
      toast({
        title: "Error loading images",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const pullImage = async (registry: string, username?: string, password?: string) => {
    try {
      await ImageApi.pullImage(registry, username, password);
      toast({
        title: "Image pulled successfully",
        description: `Successfully pulled ${registry}`,
      });
      await loadImages(); // Refresh the list
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to pull image';
      toast({
        title: "Failed to pull image",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const buildImage = async (contextPath: string, dockerfilePath: string, tag: string) => {
    try {
      await ImageApi.buildImage({ tag, contextPath, dockerfilePath });
      toast({
        title: "Image built successfully",
        description: `Successfully built ${tag}`,
      });
      await loadImages(); // Refresh the list
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to build image';
      toast({
        title: "Failed to build image",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const tagImage = async (existingTag: string, newTag: string) => {
    try {
      await ImageApi.tagImage(existingTag, newTag);
      toast({
        title: "Image tagged successfully",
        description: `Tagged ${existingTag} as ${newTag}`,
      });
      await loadImages(); // Refresh the list
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to tag image';
      toast({
        title: "Failed to tag image",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const pushImage = async (imageTag: string) => {
    try {
      await ImageApi.pushImage(imageTag);
      toast({
        title: "Image pushed successfully",
        description: `Successfully pushed ${imageTag}`,
      });
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to push image';
      toast({
        title: "Failed to push image",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteImage = async (imageTag: string) => {
    try {
      await ImageApi.deleteImage(imageTag);
      toast({
        title: "Image deleted successfully",
        description: `Successfully deleted ${imageTag}`,
      });
      await loadImages(); // Refresh the list
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to delete image';
      toast({
        title: "Failed to delete image",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const pruneImages = async () => {
    try {
      await ImageApi.pruneImages();
      toast({
        title: "Images pruned successfully",
        description: "Removed unused images",
      });
      await loadImages(); // Refresh the list
    } catch (err) {
      const message = err instanceof ImageApiError ? err.message : 'Failed to prune images';
      toast({
        title: "Failed to prune images",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    images,
    loading,
    error,
    loadImages,
    pullImage,
    buildImage,
    tagImage,
    pushImage,
    deleteImage,
    pruneImages
  };
}