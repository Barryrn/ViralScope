"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconVideo,
  IconEye,
  IconExternalLink,
  IconX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { formatNumber } from "@/lib/youtube-utils";
import type { ChannelData } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface ChannelHeaderProps {
  channel: ChannelData;
  videoCount?: number;
  onReset?: () => void;
  className?: string;
}

export function ChannelHeader({
  channel,
  videoCount,
  onReset,
  className,
}: ChannelHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border border-border/50 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border/50">
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          {/* YouTube badge */}
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 ring-2 ring-card">
            <IconBrandYoutube className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight">
              {channel.title}
            </h2>
            {channel.customUrl && (
              <Badge
                variant="secondary"
                className="hidden text-xs sm:inline-flex"
              >
                {channel.customUrl}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="mt-1.5 flex flex-wrap gap-4 text-sm">
            <StatItem
              icon={IconUsers}
              value={formatNumber(channel.subscriberCount)}
              label="subscribers"
            />
            <StatItem
              icon={IconVideo}
              value={formatNumber(channel.videoCount)}
              label="videos"
            />
            <StatItem
              icon={IconEye}
              value={formatNumber(channel.viewCount)}
              label="views"
            />
          </div>

          {/* Video count badge - shown when analyzing */}
          {videoCount !== undefined && (
            <div className="mt-2">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                <span className="mr-1.5 flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {videoCount} videos loaded
              </Badge>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 gap-1.5 text-xs"
          >
            <a
              href={`https://youtube.com/${channel.customUrl || `channel/${channel.id}`}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View on YouTube</span>
              <span className="sm:hidden">View</span>
            </a>
          </Button>
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof IconUsers;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium tabular-nums text-foreground">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
