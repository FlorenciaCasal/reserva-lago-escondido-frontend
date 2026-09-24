"use client";

import React from "react";
import MediaGalleryManager from "@/components/admin/media/MediaGalleryManager";
import {
  createNewsGalleryItem,
  deleteNewsGalleryItem,
  listAdminNewsGallery,
  updateNewsGalleryItem,
  uploadNewsImage,
} from "@/services/news";

export default function NewsGalleryManager({ newsId }: { newsId: string }) {
  return (
    <MediaGalleryManager
      title="Galeria multimedia"
      description="Administra imagenes y videos de YouTube complementarios para el detalle publico de la novedad."
      emptyMessage="Todavia no hay elementos multimedia en la galeria."
      loadItems={React.useCallback(() => listAdminNewsGallery(newsId), [newsId])}
      createItem={React.useCallback((input) => createNewsGalleryItem(newsId, input), [newsId])}
      updateItem={React.useCallback((itemId, input) => updateNewsGalleryItem(newsId, itemId, input), [newsId])}
      deleteItem={React.useCallback((itemId) => deleteNewsGalleryItem(newsId, itemId), [newsId])}
      uploadImage={uploadNewsImage}
    />
  );
}
