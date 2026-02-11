// Analytics utilities for calculating Viral Score and Performance Score

import type { VideoData } from "@/convex/youtubeTypes";
import { parseDurationToSeconds } from "./youtube-utils";

// Re-export for backwards compatibility
export { parseDurationToSeconds };

/**
 * Score weight configuration
 */
export interface ScoreWeights {
  viral: {
    velocity: number;
    engagement: number;
    comment: number;
  };
  performance: {
    engagement: number;
    comment: number;
  };
}

/**
 * Default weight values
 */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  viral: {
    velocity: 0.6,
    engagement: 0.25,
    comment: 0.15,
  },
  performance: {
    engagement: 0.75,
    comment: 0.25,
  },
};

/**
 * Raw metrics before normalization
 */
interface RawMetrics {
  engagementRate: number;
  commentRate: number;
  velocity: number;
}

/**
 * Normalization bounds for min-max normalization
 */
interface NormalizationBounds {
  engagement: { min: number; max: number };
  comment: { min: number; max: number };
  velocity: { min: number; max: number };
}

/**
 * Video classification based on duration
 * Shorts: <= 60 seconds (YouTube Shorts spec)
 * Long-form: > 60 seconds
 */
export type VideoType = "short" | "long" | "all";

/**
 * Classify video as Short or Long-form
 * Shorts are typically <= 60 seconds
 */
export function classifyVideoType(video: VideoData): "short" | "long" {
  const durationSeconds = parseDurationToSeconds(video.duration);
  return durationSeconds <= 60 ? "short" : "long";
}

/**
 * Check if a video is a YouTube Short
 */
export function isShort(video: VideoData): boolean {
  return classifyVideoType(video) === "short";
}

/**
 * Calculate days since video was published
 */
export function daysSincePublish(publishedAt: string): number {
  const publishDate = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - publishDate.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return Math.max(days, 0.01); // Minimum 0.01 to avoid division by zero
}

/**
 * Check if video is within a timeframe
 */
export function isWithinTimeframe(
  publishedAt: string,
  days: number | null
): boolean {
  if (days === null) return true; // No filter = include all
  return daysSincePublish(publishedAt) <= days;
}

/**
 * Timeframe options for filtering
 */
export const TIMEFRAME_OPTIONS = [
  { value: "60", label: "Last 60 days", days: 60 },
  { value: "90", label: "Last 90 days", days: 90 },
  { value: "180", label: "Last 180 days", days: 180 },
  { value: "360", label: "Last 360 days", days: 360 },
] as const;

export type TimeframeValue = (typeof TIMEFRAME_OPTIONS)[number]["value"];

export const DEFAULT_TIMEFRAME: TimeframeValue = "60";

/**
 * Calculate Engagement Rate
 * (likes + comments) / views
 */
export function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number
): number {
  if (views === 0) return 0;
  return (likes + comments) / views;
}

/**
 * Calculate Comment Rate
 * comments / views
 */
export function calculateCommentRate(views: number, comments: number): number {
  if (views === 0) return 0;
  return comments / views;
}

/**
 * Calculate Velocity (using log scale for better normalization)
 * log(views / days_since_upload + 1)
 */
export function calculateVelocity(
  views: number,
  publishedAt: string
): number {
  const days = daysSincePublish(publishedAt);
  return Math.log(views / days + 1);
}

/**
 * Min-max normalization
 * Returns 0.5 if min equals max (avoid division by zero)
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Calculate raw metrics for a single video
 */
function calculateRawMetrics(video: VideoData): RawMetrics {
  return {
    engagementRate: calculateEngagementRate(
      video.viewCount,
      video.likeCount,
      video.commentCount
    ),
    commentRate: calculateCommentRate(video.viewCount, video.commentCount),
    velocity: calculateVelocity(video.viewCount, video.publishedAt),
  };
}

/**
 * Get normalization bounds from a set of videos
 */
function getNormalizationBounds(videos: VideoData[]): NormalizationBounds {
  if (videos.length === 0) {
    return {
      engagement: { min: 0, max: 1 },
      comment: { min: 0, max: 1 },
      velocity: { min: 0, max: 1 },
    };
  }

  const metrics = videos.map((v) => calculateRawMetrics(v));

  const engagementRates = metrics.map((m) => m.engagementRate);
  const commentRates = metrics.map((m) => m.commentRate);
  const velocities = metrics.map((m) => m.velocity);

  return {
    engagement: {
      min: Math.min(...engagementRates),
      max: Math.max(...engagementRates),
    },
    comment: {
      min: Math.min(...commentRates),
      max: Math.max(...commentRates),
    },
    velocity: {
      min: Math.min(...velocities),
      max: Math.max(...velocities),
    },
  };
}

/**
 * Calculate Viral Score with normalized metrics and weights
 *
 * Measures momentum and current traction.
 * Answers: "What is blowing up right now?"
 *
 * Formula:
 * Viral Score = 100 × (vel_weight × vel_norm + eng_weight × eng_norm + comm_weight × comm_norm)
 *
 * High score means: strong interaction, fast growth, currently trending
 */
function calculateViralScoreFromNormalized(
  engNorm: number,
  commNorm: number,
  velNorm: number,
  weights: ScoreWeights["viral"]
): number {
  const score =
    100 *
    (weights.velocity * velNorm +
      weights.engagement * engNorm +
      weights.comment * commNorm);

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate Performance Score with normalized metrics and weights
 *
 * Measures overall success and content quality.
 * Answers: "Which videos are consistently strong?"
 *
 * Formula:
 * Performance Score = 100 × (eng_weight × eng_norm + comm_weight × comm_norm)
 *
 * High score means: good engagement, solid reach
 */
function calculatePerformanceScoreFromNormalized(
  engNorm: number,
  commNorm: number,
  weights: ScoreWeights["performance"]
): number {
  const score =
    100 * (weights.engagement * engNorm + weights.comment * commNorm);

  return Math.min(Math.max(score, 0), 100);
}

/**
 * @deprecated Use processVideosWithScores for batch processing with proper normalization
 * Legacy function for single video score calculation (uses fixed normalization)
 */
export function calculateViralScore(video: VideoData): number {
  const engagementRate = calculateEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );
  const commentRate = calculateCommentRate(video.viewCount, video.commentCount);
  const velocity = calculateVelocity(video.viewCount, video.publishedAt);

  // Legacy fixed normalization
  const normalizedEngagement = Math.min(engagementRate * 10, 1);
  const normalizedCommentRate = Math.min(commentRate * 100, 1);
  const velocityComponent = Math.min(velocity / 15, 1); // Adjusted for log scale

  return calculateViralScoreFromNormalized(
    normalizedEngagement,
    normalizedCommentRate,
    velocityComponent,
    DEFAULT_WEIGHTS.viral
  );
}

/**
 * @deprecated Use processVideosWithScores for batch processing with proper normalization
 * Legacy function for single video score calculation (uses fixed normalization)
 */
export function calculatePerformanceScore(video: VideoData): number {
  const engagementRate = calculateEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );
  const commentRate = calculateCommentRate(video.viewCount, video.commentCount);

  // Legacy fixed normalization
  const normalizedEngagement = Math.min(engagementRate * 10, 1);
  const normalizedCommentRate = Math.min(commentRate * 100, 1);

  return calculatePerformanceScoreFromNormalized(
    normalizedEngagement,
    normalizedCommentRate,
    DEFAULT_WEIGHTS.performance
  );
}

/**
 * Get score interpretation label
 */
export function getScoreLabel(score: number): {
  label: string;
  color: "red" | "orange" | "yellow" | "green" | "emerald";
} {
  if (score >= 80) return { label: "Exceptional", color: "emerald" };
  if (score >= 60) return { label: "Strong", color: "green" };
  if (score >= 40) return { label: "Average", color: "yellow" };
  if (score >= 20) return { label: "Below Average", color: "orange" };
  return { label: "Low", color: "red" };
}

/**
 * Enhanced video data with calculated scores
 */
export interface VideoWithScores extends VideoData {
  viralScore: number;
  performanceScore: number;
  videoType: "short" | "long";
  daysSincePublish: number;
  engagementRate: number;
  commentRate: number;
  velocity: number;
}

/**
 * Process multiple videos with proper min-max normalization and configurable weights
 * This is the recommended function for calculating scores
 */
export function processVideosWithScores(
  videos: VideoData[],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): VideoWithScores[] {
  if (videos.length === 0) return [];

  // Calculate normalization bounds across all videos
  const bounds = getNormalizationBounds(videos);

  return videos.map((video) => {
    const rawMetrics = calculateRawMetrics(video);

    // Normalize metrics using min-max normalization
    const engNorm = normalize(
      rawMetrics.engagementRate,
      bounds.engagement.min,
      bounds.engagement.max
    );
    const commNorm = normalize(
      rawMetrics.commentRate,
      bounds.comment.min,
      bounds.comment.max
    );
    const velNorm = normalize(
      rawMetrics.velocity,
      bounds.velocity.min,
      bounds.velocity.max
    );

    // Calculate scores with normalized metrics and weights
    const viralScore = calculateViralScoreFromNormalized(
      engNorm,
      commNorm,
      velNorm,
      weights.viral
    );
    const performanceScore = calculatePerformanceScoreFromNormalized(
      engNorm,
      commNorm,
      weights.performance
    );

    return {
      ...video,
      viralScore,
      performanceScore,
      videoType: classifyVideoType(video),
      daysSincePublish: daysSincePublish(video.publishedAt),
      engagementRate: rawMetrics.engagementRate,
      commentRate: rawMetrics.commentRate,
      velocity: rawMetrics.velocity,
    };
  });
}

/**
 * @deprecated Use processVideosWithScores for batch processing with proper normalization
 * Legacy function for single video processing (uses fixed normalization)
 */
export function processVideoWithScores(video: VideoData): VideoWithScores {
  return {
    ...video,
    viralScore: calculateViralScore(video),
    performanceScore: calculatePerformanceScore(video),
    videoType: classifyVideoType(video),
    daysSincePublish: daysSincePublish(video.publishedAt),
    engagementRate: calculateEngagementRate(
      video.viewCount,
      video.likeCount,
      video.commentCount
    ),
    commentRate: calculateCommentRate(video.viewCount, video.commentCount),
    velocity: calculateVelocity(video.viewCount, video.publishedAt),
  };
}

/**
 * Filter and process videos based on type and timeframe
 * Uses batch processing with min-max normalization for accurate scores
 */
export function filterAndProcessVideos(
  videos: VideoData[],
  videoType: VideoType,
  timeframeDays: number | null,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): VideoWithScores[] {
  const filteredVideos = videos.filter((video) => {
    // Filter by timeframe
    if (!isWithinTimeframe(video.publishedAt, timeframeDays)) {
      return false;
    }

    // Filter by video type
    if (videoType === "all") return true;
    return classifyVideoType(video) === videoType;
  });

  // Use batch processing for proper normalization across the filtered set
  return processVideosWithScores(filteredVideos, weights);
}

/**
 * Sort options for video sorting
 */
export type SortOption = "viral" | "performance" | "views" | "date" | "comments" | "likes";

export const SORT_OPTIONS = [
  { value: "viral" as const, label: "Viral Score" },
  { value: "performance" as const, label: "Performance Score" },
  { value: "views" as const, label: "Views" },
  { value: "date" as const, label: "Date" },
  { value: "comments" as const, label: "Comments" },
  { value: "likes" as const, label: "Likes" },
] as const;

/**
 * Sort videos by a specific criterion
 */
export function sortVideos(
  videos: VideoWithScores[],
  sortBy: SortOption
): VideoWithScores[] {
  return [...videos].sort((a, b) => {
    switch (sortBy) {
      case "viral":
        return b.viralScore - a.viralScore;
      case "performance":
        return b.performanceScore - a.performanceScore;
      case "views":
        return b.viewCount - a.viewCount;
      case "date":
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case "comments":
        return b.commentCount - a.commentCount;
      case "likes":
        return b.likeCount - a.likeCount;
      default:
        return b.viralScore - a.viralScore;
    }
  });
}

/**
 * Sort videos by a specific score (legacy - kept for compatibility)
 */
export function sortByScore(
  videos: VideoWithScores[],
  sortBy: "viral" | "performance"
): VideoWithScores[] {
  return sortVideos(videos, sortBy);
}

/**
 * Get summary statistics for a set of videos
 */
export function getVideoStats(videos: VideoWithScores[]) {
  if (videos.length === 0) {
    return {
      count: 0,
      avgViralScore: 0,
      avgPerformanceScore: 0,
      topViralVideo: null,
      topPerformanceVideo: null,
      shortsCount: 0,
      longFormCount: 0,
    };
  }

  const avgViralScore =
    videos.reduce((sum, v) => sum + v.viralScore, 0) / videos.length;
  const avgPerformanceScore =
    videos.reduce((sum, v) => sum + v.performanceScore, 0) / videos.length;

  const sortedByViral = sortByScore(videos, "viral");
  const sortedByPerformance = sortByScore(videos, "performance");

  return {
    count: videos.length,
    avgViralScore,
    avgPerformanceScore,
    topViralVideo: sortedByViral[0] || null,
    topPerformanceVideo: sortedByPerformance[0] || null,
    shortsCount: videos.filter((v) => v.videoType === "short").length,
    longFormCount: videos.filter((v) => v.videoType === "long").length,
  };
}
