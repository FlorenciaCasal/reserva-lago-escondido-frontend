import type { MediaAsset } from "@/types/project";

export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type NewsImage = {
  id: string;
  newsId: string;
  mediaAssetId?: string | null;
  imageUrl: string;
  altText?: string | null;
  caption?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type News = {
  id: string;
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageAssetId?: string | null;
  imageUrl?: string | null;
  videoAssetId?: string | null;
  videoUrl?: string | null;
  status: NewsStatus;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  images?: NewsImage[];
};

export type CreateNewsInput = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageAssetId?: string | null;
  imageUrl?: string | null;
  videoAssetId?: string | null;
  videoUrl?: string | null;
  status: NewsStatus;
};

export type UpdateNewsInput = CreateNewsInput;

export type NewsImageInput = {
  imageUrl: string;
  mediaAssetId?: string | null;
  altText?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type NewsMediaAsset = MediaAsset;
