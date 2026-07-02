export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type MediaAsset = {
  id: string;
  kind: "IMAGE" | "DOCUMENT" | "VIDEO";
  url: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  checksum?: string | null;
  createdAt?: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageAssetId?: string | null;
  imageUrl?: string | null;
  videoAssetId?: string | null;
  videoUrl?: string | null;
  featured: boolean;
  status: ProjectStatus;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  gallery?: ProjectImage[];
  documents?: ProjectDocument[];
};

export type ProjectImage = {
  id: string;
  projectId: string;
  mediaAssetId?: string | null;
  imageUrl: string;
  altText?: string | null;
  caption?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectAdvance = {
  id: string;
  projectId: string;
  advanceDate: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAssetId?: string | null;
  videoUrl?: string | null;
  videoAssetId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectDocument = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  mediaAssetId?: string | null;
  fileType?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type GenerateProjectInput = {
  description: string;
  objective: string;
  targetAudience: string;
  highlights?: string;
  imageUrl?: string;
};

export type GeneratedProjectDraft = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageUrl?: string | null;
};

export type CreateProjectInput = GeneratedProjectDraft & {
  imageAssetId?: string | null;
  videoAssetId?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  status: ProjectStatus;
};

export type UpdateProjectInput = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  imageAssetId?: string | null;
  imageUrl?: string | null;
  videoAssetId?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  status?: ProjectStatus;
};

export type ProjectAdvanceInput = {
  advanceDate: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAssetId?: string | null;
  videoUrl?: string | null;
  videoAssetId?: string | null;
};

export type GenerateProjectAdvanceInput = {
  whatHappened: string;
  advanceDate?: string | null;
  relevantData?: string | null;
  tone?: string | null;
};

export type GeneratedProjectAdvanceDraft = {
  advanceDate: string;
  title: string;
  description: string;
};

export type ProjectImageInput = {
  imageUrl: string;
  mediaAssetId?: string | null;
  altText?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type ProjectDocumentInput = {
  title: string;
  description?: string | null;
  fileUrl: string;
  mediaAssetId?: string | null;
  fileType?: string | null;
  sortOrder?: number;
};
