// src/domain/Image.ts
export interface IImage {
  _id: string;
  url: string;
  image_type: "profile_picture" | "cover_photo";
  owner_id: string;
  created_at: string;
  likes_count: number;
  liked_by: string[];
  comments_count: number;
}

export interface ImageComment {
  _id: string;
  content: string;
  author_id: string;
  author_username: string;
  profile_picture?: string;
  image_id: string;
  created_at: string;
}


export interface ImageUploadResponse {
  _id: string;
  url: string;
  image_type: "profile_picture" | "cover_photo";
  owner_id: string;
  created_at: string;
}

export type ImageType = "profile_picture" | "cover_photo";
export type ImageUploadType = ImageType;