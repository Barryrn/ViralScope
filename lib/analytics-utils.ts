// Analytics utilities for calculating Viral Score and Performance Score

import type { VideoData } from "@/convex/youtubeTypes";
import { parseDurationToSeconds } from "./youtube-utils";

// Re-export for backwards compatibility
export { parseDurationToSeconds };

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
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "60", label: "Last 60 days", days: 60 },
  { value: "90", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
] as const;

export type TimeframeValue = (typeof TIMEFRAME_OPTIONS)[number]["value"];

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
 * Calculate Velocity
 * views / days_since_publish
 */
export function calculateVelocity(
  views: number,
  publishedAt: string
): number {
  const days = daysSincePublish(publishedAt);
  return views / days;
}

/**
 * Calculate Viral Score
 *
 * Measures momentum and current traction.
 * Answers: "What is blowing up right now?"
 *
 * Formula:
 * Viral Score = 100 × [
 *   0.6 × engagement_rate +
 *   0.3 × comment_rate +
 *   0.1 × log10(velocity + 1)
 * ]
 *
 * High score means: strong interaction, fast growth, currently trending
 */
export function calculateViralScore(video: VideoData): number {
  const engagementRate = calculateEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );
  const commentRate = calculateCommentRate(video.viewCount, video.commentCount);
  const velocity = calculateVelocity(video.viewCount, video.publishedAt);

  // Normalize engagement rate (typical range 0-0.1, so multiply by 10 for 0-1 range)
  const normalizedEngagement = Math.min(engagementRate * 10, 1);

  // Normalize comment rate (typical range 0-0.01, so multiply by 100 for 0-1 range)
  const normalizedCommentRate = Math.min(commentRate * 100, 1);

  // Velocity component using log scale (normalize to 0-1 range)
  // Velocity of 1M views/day → log10(1000001) ≈ 6, divide by 7 for normalization
  const velocityComponent = Math.min(Math.log10(velocity + 1) / 7, 1);

  const score =
    100 *
    (0.6 * normalizedEngagement +
      0.3 * normalizedCommentRate +
      0.1 * velocityComponent);

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculate Performance Score
 *
 * Measures overall success and content quality.
 * Answers: "Which videos are consistently strong?"
 *
 * Formula:
 * Performance Score = 100 × [
 *   0.7 × engagement_rate +
 *   0.3 × (view_factor / 10)
 * ]
 *
 * High score means: good engagement, solid reach, not dominated by huge channels
 */
export function calculatePerformanceScore(video: VideoData): number {
  const engagementRate = calculateEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );

  // View factor: log10(views + 1)
  // Range: 0 (1 view) to ~10 (10B views)
  const viewFactor = Math.log10(video.viewCount + 1);

  // Normalize engagement rate (typical range 0-0.1, so multiply by 10 for 0-1 range)
  const normalizedEngagement = Math.min(engagementRate * 10, 1);

  // Normalize view factor (divide by 10 as per formula, then cap at 1)
  const normalizedViewFactor = Math.min(viewFactor / 10, 1);

  const score =
    100 * (0.7 * normalizedEngagement + 0.3 * normalizedViewFactor);

  return Math.min(Math.max(score, 0), 100);
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
 * Process a video and add all calculated metrics
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
 */
export function filterAndProcessVideos(
  videos: VideoData[],
  videoType: VideoType,
  timeframeDays: number | null
): VideoWithScores[] {
  return videos
    .filter((video) => {
      // Filter by timeframe
      if (!isWithinTimeframe(video.publishedAt, timeframeDays)) {
        return false;
      }

      // Filter by video type
      if (videoType === "all") return true;
      return classifyVideoType(video) === videoType;
    })
    .map(processVideoWithScores);
}

/**
 * Sort videos by a specific score
 */
export function sortByScore(
  videos: VideoWithScores[],
  sortBy: "viral" | "performance"
): VideoWithScores[] {
  return [...videos].sort((a, b) => {
    const scoreA = sortBy === "viral" ? a.viralScore : a.performanceScore;
    const scoreB = sortBy === "viral" ? b.viralScore : b.performanceScore;
    return scoreB - scoreA;
  });
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
