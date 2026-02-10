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
  videoCount: number;
  onReset: () => void;
}

export function ChannelHeader({ channel, videoCount, onReset }: ChannelHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-card via-card to-card/90"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-red-500/20">
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          {/* YouTube badge */}
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 ring-2 ring-background">
            <IconBrandYoutube className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight truncate">{channel.title}</h2>
            {channel.customUrl && (
              <Badge variant="secondary" className="text-xs">
                {channel.customUrl}
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
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
              label="total views"
            />
          </div>

          {/* Analyzing badge */}
          <div className="mt-3">
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <span className="mr-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Analyzing {videoCount} videos
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1.5"
          >
            <a
              href={`https://youtube.com/${channel.customUrl || `channel/${channel.id}`}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconExternalLink className="h-4 w-4" />
              View Channel
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8"
          >
            <IconX className="h-4 w-4" />
          </Button>
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
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
