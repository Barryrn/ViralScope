"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconEye,
  IconThumbUp,
  IconMessage,
  IconClock,
  IconChevronDown,
  IconVideo,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  formatNumber,
  formatDuration,
  timeAgo,
} from "@/lib/youtube-utils";
import type { VideoData, ChannelVideosResult } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface ChannelVideosGridProps {
  data: ChannelVideosResult;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  className?: string;
}

export function ChannelVideosGrid({
  data,
  onLoadMore,
  isLoadingMore,
  className,
}: ChannelVideosGridProps) {
  if (data.videos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Video Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.videos.map((video, index) => (
          <ChannelVideoThumbnail key={video.id} video={video} index={index} />
        ))}
      </div>

      {/* Load More Button */}
      {data.nextPageToken && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-2"
        >
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="group gap-2 border-border/50 bg-card/50 px-6 transition-all hover:border-red-500/30 hover:bg-red-500/5"
          >
            {isLoadingMore ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent"
                />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More Videos</span>
                <IconChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

interface ChannelVideoThumbnailProps {
  video: VideoData;
  index: number;
}

function ChannelVideoThumbnail({ video, index }: ChannelVideoThumbnailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.04,
      }}
    >
      <a
        href={`https://youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/5">
          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <IconVideo className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Duration badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 border-0 bg-black/80 font-mono text-[10px] font-medium tracking-wide text-white backdrop-blur-sm"
            >
              <IconClock className="mr-1 h-2.5 w-2.5" />
              {formatDuration(video.duration)}
            </Badge>

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl shadow-red-500/30"
              >
                <IconPlayerPlay className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Title */}
            <h4 className="line-clamp-2 text-sm font-medium leading-snug tracking-tight transition-colors duration-200 group-hover:text-red-500">
              {video.title}
            </h4>

            {/* Publish date */}
            <p className="mt-2 text-xs text-muted-foreground/80">
              {timeAgo(video.publishedAt)}
            </p>

            {/* Engagement metrics */}
            <div className="mt-3 flex items-center gap-4 border-t border-border/30 pt-3">
              <MetricPill
                icon={IconEye}
                value={formatNumber(video.viewCount)}
                color="blue"
              />
              <MetricPill
                icon={IconThumbUp}
                value={formatNumber(video.likeCount)}
                color="emerald"
              />
              <MetricPill
                icon={IconMessage}
                value={formatNumber(video.commentCount)}
                color="violet"
              />
            </div>
          </div>
        </Card>
      </a>
    </motion.div>
  );
}

interface MetricPillProps {
  icon: typeof IconEye;
  value: string;
  color: "blue" | "emerald" | "violet";
}

const metricColors = {
  blue: "text-blue-500/80",
  emerald: "text-emerald-500/80",
  violet: "text-violet-500/80",
};

function MetricPill({ icon: Icon, value, color }: MetricPillProps) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <Icon className={cn("h-3.5 w-3.5", metricColors[color])} />
      <span className="font-medium tabular-nums text-muted-foreground">
        {value}
      </span>
    </span>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/10 py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-muted/50 p-4">
        <IconVideo className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">
        No videos found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
        This channel hasn&apos;t uploaded any public videos yet
      </p>
    </motion.div>
  );
}
