// YouTube URL parsing and formatting utilities

// Regex patterns
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const CHANNEL_ID_REGEX = /^UC[a-zA-Z0-9_-]{22}$/;

// YouTube URL patterns for video extraction
const VIDEO_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

// YouTube URL patterns for channel extraction
const CHANNEL_URL_PATTERNS = [
  { pattern: /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/, isHandle: false },
  { pattern: /youtube\.com\/@([a-zA-Z0-9_.-]+)/, isHandle: true },
  { pattern: /youtube\.com\/c\/([a-zA-Z0-9_.-]+)/, isHandle: true },
  { pattern: /youtube\.com\/user\/([a-zA-Z0-9_.-]+)/, isHandle: true },
];

export type ParsedYouTubeInput =
  | { type: "video"; id: string }
  | { type: "channel"; id: string; isHandle: boolean }
  | { type: "search"; query: string };

/**
 * Parse user input to determine if it's a video URL, channel URL, or search query
 */
export function parseYouTubeInput(input: string): ParsedYouTubeInput {
  const trimmed = input.trim();

  // Check for direct video ID (11 characters)
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return { type: "video", id: trimmed };
  }

  // Check for direct channel ID (UC + 22 characters)
  if (CHANNEL_ID_REGEX.test(trimmed)) {
    return { type: "channel", id: trimmed, isHandle: false };
  }

  // Parse video URLs
  for (const pattern of VIDEO_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return { type: "video", id: match[1] };
    }
  }

  // Parse channel URLs
  for (const { pattern, isHandle } of CHANNEL_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return { type: "channel", id: match[1], isHandle };
    }
  }

  // Default to search query
  return { type: "search", query: trimmed };
}

/**
 * Validate if the input looks like a valid YouTube URL or query
 */
export function isValidYouTubeInput(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.length > 0 && trimmed.length <= 500;
}

/**
 * Format large numbers for display (e.g., 1000000 → "1M")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

/**
 * Format ISO 8601 duration to readable format (e.g., "PT5M32S" → "5:32")
 */
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format date for display
 */
export function formatPublishDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate time ago from date
 */
export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number
): number {
  if (views === 0) return 0;
  return ((likes + comments) / views) * 100;
}

/**
 * Get video thumbnail URL at different qualities
 */
export function getVideoThumbnail(
  videoId: string,
  quality: "default" | "medium" | "high" | "maxres" = "high"
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality === "maxres" ? "maxresdefault" : quality === "high" ? "hqdefault" : quality === "medium" ? "mqdefault" : "default"}.jpg`;
}
