"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconVideo,
  IconEye,
  IconCalendar,
  IconExternalLink,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { formatNumber, formatPublishDate } from "@/lib/youtube-utils";
import type { ChannelData } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface ChannelCardProps {
  channel: ChannelData;
  className?: string;
}

export function ChannelCard({ channel, className }: ChannelCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      {/* Header with gradient background */}
      <div className="relative h-32 bg-gradient-to-br from-red-500/20 via-pink-500/10 to-purple-500/20">
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]" />

        {/* Channel link */}
        <a
          href={`https://youtube.com/${channel.customUrl || `channel/${channel.id}`}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <IconBrandYoutube className="h-4 w-4" />
          <span className="hidden sm:inline">View Channel</span>
          <IconExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Profile section */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4">
          <div className="relative inline-block">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-card shadow-xl">
              <Image
                src={channel.thumbnailUrl}
                alt={channel.title}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Verified badge placeholder */}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-red-500 text-white">
              <IconBrandYoutube className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Channel name */}
        <h2 className="text-2xl font-bold tracking-tight">{channel.title}</h2>

        {/* Custom URL */}
        {channel.customUrl && (
          <p className="mt-1 text-sm text-muted-foreground">
            {channel.customUrl}
          </p>
        )}

        {/* Description */}
        {channel.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {channel.description}
          </p>
        )}

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <StatCard
            icon={IconUsers}
            label="Subscribers"
            value={formatNumber(channel.subscriberCount)}
            color="red"
          />
          <StatCard
            icon={IconVideo}
            label="Videos"
            value={formatNumber(channel.videoCount)}
            color="blue"
          />
          <StatCard
            icon={IconEye}
            label="Total Views"
            value={formatNumber(channel.viewCount)}
            color="purple"
          />
        </div>

        {/* Join date */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <IconCalendar className="h-4 w-4" />
          <span>Joined {formatPublishDate(channel.publishedAt)}</span>
        </div>
      </div>
    </Card>
  );
}

interface StatCardProps {
  icon: typeof IconUsers;
  label: string;
  value: string;
  color: "red" | "blue" | "purple";
}

const colorClasses = {
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
};

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-xl border p-4 text-center transition-all hover:scale-[1.02]",
        colors.border,
        colors.bg
      )}
    >
      <div className={cn("mb-2 flex justify-center", colors.text)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
