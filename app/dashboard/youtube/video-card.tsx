"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconEye,
  IconThumbUp,
  IconMessage,
  IconClock,
  IconCalendar,
  IconUser,
  IconHash,
  IconTrendingUp,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  formatNumber,
  formatDuration,
  formatPublishDate,
  timeAgo,
  calculateEngagementRate,
} from "@/lib/youtube-utils";
import type { VideoData } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: VideoData;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  const engagementRate = calculateEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="grid gap-6 md:grid-cols-[400px_1fr]">
        {/* Thumbnail Section */}
        <div className="relative aspect-video overflow-hidden md:aspect-auto md:h-full">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Duration badge */}
          <Badge
            variant="secondary"
            className="absolute bottom-3 right-3 border-0 bg-black/80 font-mono text-white backdrop-blur-sm"
          >
            <IconClock className="mr-1 h-3 w-3" />
            {formatDuration(video.duration)}
          </Badge>

          {/* External link */}
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <IconExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Content Section */}
        <div className="flex flex-col p-6 md:py-6 md:pr-6 md:pl-0">
          {/* Title */}
          <h2 className="text-xl font-semibold leading-tight tracking-tight md:text-2xl">
            {video.title}
          </h2>

          {/* Channel info */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <IconUser className="h-4 w-4" />
            <span className="font-medium">{video.channelTitle}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{timeAgo(video.publishedAt)}</span>
          </div>

          {/* Metrics Grid */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <MetricCard
              icon={IconEye}
              label="Views"
              value={formatNumber(video.viewCount)}
              color="blue"
            />
            <MetricCard
              icon={IconThumbUp}
              label="Likes"
              value={formatNumber(video.likeCount)}
              color="green"
            />
            <MetricCard
              icon={IconMessage}
              label="Comments"
              value={formatNumber(video.commentCount)}
              color="purple"
            />
          </div>

          {/* Engagement Rate */}
          <div className="mt-4 rounded-xl border border-border/50 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <IconTrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Engagement Rate
                </span>
              </div>
              <span className="text-2xl font-bold tabular-nums">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {engagementRate.toFixed(2)}%
                </span>
              </span>
            </div>
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {video.tags.slice(0, 6).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-border/50 bg-muted/50 text-xs font-normal"
                  >
                    <IconHash className="mr-0.5 h-3 w-3 opacity-50" />
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 6 && (
                  <Badge
                    variant="outline"
                    className="border-border/50 bg-muted/50 text-xs font-normal"
                  >
                    +{video.tags.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Publish date footer */}
          <div className="mt-auto pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconCalendar className="h-3.5 w-3.5" />
              <span>Published {formatPublishDate(video.publishedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface MetricCardProps {
  icon: typeof IconEye;
  label: string;
  value: string;
  color: "blue" | "green" | "purple";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    border: "border-green-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
};

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-3 text-center transition-colors",
        colors.border,
        colors.bg
      )}
    >
      <div className={cn("mb-1 flex justify-center", colors.text)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
