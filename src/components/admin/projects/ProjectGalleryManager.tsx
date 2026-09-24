"use client";

import React from "react";
import MediaGalleryManager from "@/components/admin/media/MediaGalleryManager";
import {
  createProjectGalleryItem,
  deleteProjectGalleryItem,
  listAdminProjectGallery,
  updateProjectGalleryItem,
  uploadProjectImage,
} from "@/services/projects";

export default function ProjectGalleryManager({ projectId }: { projectId: string }) {
  return (
    <MediaGalleryManager
      title="Galeria multimedia"
      description="Administra imagenes y videos de YouTube asociados al proyecto sin reemplazar el medio principal."
      emptyMessage="Todavia no hay elementos multimedia asociados a este proyecto."
      loadItems={React.useCallback(() => listAdminProjectGallery(projectId), [projectId])}
      createItem={React.useCallback((input) => createProjectGalleryItem(projectId, input), [projectId])}
      updateItem={React.useCallback((itemId, input) => updateProjectGalleryItem(projectId, itemId, input), [projectId])}
      deleteItem={React.useCallback((itemId) => deleteProjectGalleryItem(projectId, itemId), [projectId])}
      uploadImage={uploadProjectImage}
    />
  );
}
