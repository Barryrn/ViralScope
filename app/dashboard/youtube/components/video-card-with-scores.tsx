"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  IconEye,
  IconThumbUp,
  IconMessage,
  IconClock,
  IconFlame,
  IconChartBar,
  IconBolt,
  IconTrendingUp,
  IconExternalLink,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  formatNumber,
  formatDuration,
  timeAgo,
} from "@/lib/youtube-utils";
import {
  processVideoWithScores,
  type VideoWithScores,
} from "@/lib/analytics-utils";
import type { VideoData } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface VideoCardWithScoresProps {
  video: VideoData | VideoWithScores;
  index?: number;
  showAnimation?: boolean;
  variant?: "grid" | "list";
  className?: string;
}

function isVideoWithScores(
  video: VideoData | VideoWithScores
): video is VideoWithScores {
  return "viralScore" in video;
}

export function VideoCardWithScores({
  video,
  index = 0,
  showAnimation = true,
  variant = "grid",
  className,
}: VideoCardWithScoresProps) {
  // Ensure we have scores calculated
  const videoWithScores = isVideoWithScores(video)
    ? video
    : processVideoWithScores(video);

  if (variant === "list") {
    return (
      <ListCard
        video={videoWithScores}
        index={index}
        showAnimation={showAnimation}
        className={className}
      />
    );
  }

  return (
    <GridCard
      video={videoWithScores}
      index={index}
      showAnimation={showAnimation}
      className={className}
    />
  );
}

// Grid variant - compact card for channel video grids
function GridCard({
  video,
  index,
  showAnimation,
  className,
}: {
  video: VideoWithScores;
  index: number;
  showAnimation: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("group", className)}
    >
      <a
        href={`https://youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:border-border hover:shadow-md">
          {/* Thumbnail */}
          <div className="relative aspect-video">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Duration badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 border-0 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white"
            >
              {formatDuration(video.duration)}
            </Badge>

            {/* Video type badge */}
            {video.videoType === "short" && (
              <Badge
                variant="secondary"
                className="absolute left-2 top-2 border-0 bg-rose-500 px-1.5 py-0.5 text-[10px] text-white"
              >
                <IconBolt className="mr-0.5 h-2.5 w-2.5" />
                Short
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-medium leading-snug">
              {video.title}
            </h3>

            {/* Meta */}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {formatNumber(video.viewCount)} views · {timeAgo(video.publishedAt)}
            </p>

            {/* Scores */}
            <div className="mt-3 flex items-center gap-2">
              <ScorePill
                score={video.viralScore}
                variant="viral"
              />
              <ScorePill
                score={video.performanceScore}
                variant="performance"
              />
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

// List variant - horizontal card for analytics view
function ListCard({
  video,
  index,
  showAnimation,
  className,
}: {
  video: VideoWithScores;
  index: number;
  showAnimation: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn("group", className)}
    >
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:border-border hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          <div className="relative aspect-video sm:aspect-auto sm:h-32 sm:w-56 lg:h-36 lg:w-64">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 256px"
            />

            {/* Duration badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 border-0 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white"
            >
              <IconClock className="mr-0.5 h-2.5 w-2.5" />
              {formatDuration(video.duration)}
            </Badge>

            {/* Video type badge */}
            {video.videoType === "short" && (
              <Badge
                variant="secondary"
                className="absolute left-2 top-2 border-0 bg-rose-500 px-1.5 py-0.5 text-[10px] text-white"
              >
                <IconBolt className="mr-0.5 h-2.5 w-2.5" />
                Short
              </Badge>
            )}

            {/* External link on hover */}
            <a
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-medium leading-snug lg:text-base">
              {video.title}
            </h3>

            {/* Channel + time */}
            <p className="mt-1 text-xs text-muted-foreground">
              {video.channelTitle} · {timeAgo(video.publishedAt)}
            </p>

            {/* Metrics */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconEye className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {formatNumber(video.viewCount)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <IconThumbUp className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {formatNumber(video.likeCount)}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <IconMessage className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {formatNumber(video.commentCount)}
                </span>
              </span>
            </div>

            {/* Scores row */}
            <div className="mt-auto flex items-center gap-3 pt-3">
              <ScorePill
                score={video.viralScore}
                variant="viral"
              />
              <ScorePill
                score={video.performanceScore}
                variant="performance"
              />

              {/* Velocity */}
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <IconTrendingUp className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {formatNumber(Math.round(video.velocity))}
                </span>
                <span>/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Score pill component - compact score display (score only, no label)
function ScorePill({
  score,
  variant,
}: {
  score: number;
  variant: "viral" | "performance";
}) {
  const Icon = variant === "viral" ? IconFlame : IconChartBar;

  const colorClasses = {
    viral: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      icon: "text-rose-500",
    },
    performance: {
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
      text: "text-cyan-600 dark:text-cyan-400",
      icon: "text-cyan-500",
    },
  };

  const colors = colorClasses[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1",
        colors.bg
      )}
    >
      <Icon className={cn("h-3 w-3", colors.icon)} />
      <span className={cn("text-xs font-semibold tabular-nums", colors.text)}>
        {score.toFixed(0)}
      </span>
    </div>
  );
}

export { ScorePill };
