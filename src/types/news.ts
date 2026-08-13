import type { MediaAsset } from "@/types/project";

export type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type SocialPlatform = "INSTAGRAM" | "FACEBOOK";

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

export type GenerateNewsInput = {
  brief: string;
  objective?: string;
  targetAudience?: string;
  highlights?: string;
  imageUrl?: string;
};

export type GeneratedNewsDraft = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageUrl?: string | null;
};

export type GenerateNewsSocialInput = {
  instructions?: string;
};

export type NewsSocialContentInput = {
  caption?: string | null;
  body?: string | null;
  hashtags?: string | null;
  callToAction?: string | null;
  altText?: string | null;
};

export type NewsSocialContent = NewsSocialContentInput & {
  id?: string | null;
  newsId: string;
  platform: SocialPlatform;
  createdAt?: string | null;
  updatedAt?: string | null;
};
