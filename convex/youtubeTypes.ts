import { v } from "convex/values";

// Convex validators for YouTube data
export const videoDataValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.string(),
  channelId: v.string(),
  channelTitle: v.string(),
  publishedAt: v.string(),
  viewCount: v.number(),
  likeCount: v.number(),
  commentCount: v.number(),
  duration: v.string(),
  tags: v.optional(v.array(v.string())),
});

export const channelDataValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.string(),
  subscriberCount: v.number(),
  videoCount: v.number(),
  viewCount: v.number(),
  customUrl: v.optional(v.string()),
  publishedAt: v.string(),
});

export const searchResultValidator = v.object({
  videos: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      thumbnailUrl: v.string(),
      channelId: v.string(),
      channelTitle: v.string(),
      publishedAt: v.string(),
    })
  ),
  totalResults: v.number(),
  nextPageToken: v.optional(v.string()),
});

// TypeScript types
export type VideoData = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  tags?: string[];
};

export type ChannelData = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  customUrl?: string;
  publishedAt: string;
};

export type SearchResultVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
};

export type SearchResult = {
  videos: SearchResultVideo[];
  totalResults: number;
  nextPageToken?: string;
};

export type ChannelVideosResult = {
  videos: VideoData[];
  nextPageToken?: string;
};

export const channelVideosResultValidator = v.object({
  videos: v.array(videoDataValidator),
  nextPageToken: v.optional(v.string()),
});
