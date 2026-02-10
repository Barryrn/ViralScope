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
import { getScoreLabel, type VideoWithScores } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./score-ring";

interface VideoAnalyticsCardProps {
  video: VideoWithScores;
  index?: number;
  showAnimation?: boolean;
}

export function VideoAnalyticsCard({
  video,
  index = 0,
  showAnimation = true,
}: VideoAnalyticsCardProps) {
  const viralLabel = getScoreLabel(video.viralScore);
  const performanceLabel = getScoreLabel(video.performanceScore);

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative"
    >
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-xl hover:shadow-black/5">
        {/* Ambient glow on hover */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />

        <div className="flex flex-col lg:flex-row">
          {/* Thumbnail Section */}
          <div className="relative aspect-video w-full lg:aspect-auto lg:h-auto lg:w-72 xl:w-80">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 320px"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-card" />

            {/* Video type badge */}
            <Badge
              variant="secondary"
              className={cn(
                "absolute left-3 top-3 border-0 backdrop-blur-md",
                video.videoType === "short"
                  ? "bg-rose-500/90 text-white"
                  : "bg-black/70 text-white"
              )}
            >
              {video.videoType === "short" ? (
                <>
                  <IconBolt className="mr-1 h-3 w-3" />
                  Short
                </>
              ) : (
                <>
                  <IconPlayerPlay className="mr-1 h-3 w-3" />
                  Video
                </>
              )}
            </Badge>

            {/* Duration badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-3 right-3 border-0 bg-black/80 font-mono text-white backdrop-blur-sm lg:bottom-auto lg:top-3"
            >
              <IconClock className="mr-1 h-3 w-3" />
              {formatDuration(video.duration)}
            </Badge>

            {/* External link */}
            <a
              href={`https://youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/20 group-hover:opacity-100 lg:left-auto lg:right-3 lg:top-12"
            >
              <IconExternalLink className="h-4 w-4" />
            </a>

            {/* Mobile scores overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between lg:hidden">
              <div className="flex gap-2">
                <ScoreBadge score={video.viralScore} variant="viral" />
                <ScoreBadge score={video.performanceScore} variant="performance" />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-1 flex-col p-5 lg:p-6">
            {/* Title */}
            <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight lg:text-lg">
              {video.title}
            </h3>

            {/* Channel + time */}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{video.channelTitle}</span>
              <span className="opacity-40">·</span>
              <span>{timeAgo(video.publishedAt)}</span>
            </div>

            {/* Metrics row */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <MetricPill icon={IconEye} value={formatNumber(video.viewCount)} label="views" />
              <MetricPill icon={IconThumbUp} value={formatNumber(video.likeCount)} label="likes" />
              <MetricPill icon={IconMessage} value={formatNumber(video.commentCount)} label="comments" />
            </div>

            {/* Score section - desktop */}
            <div className="mt-auto hidden pt-5 lg:block">
              <div className="flex items-center gap-6">
                {/* Viral Score Ring */}
                <div className="flex items-center gap-3">
                  <ScoreRing
                    score={video.viralScore}
                    size="sm"
                    label="Viral"
                    variant="viral"
                    showAnimation={showAnimation}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Viral Score
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        viralLabel.color === "emerald" && "text-emerald-500",
                        viralLabel.color === "green" && "text-green-500",
                        viralLabel.color === "yellow" && "text-yellow-500",
                        viralLabel.color === "orange" && "text-orange-500",
                        viralLabel.color === "red" && "text-red-500"
                      )}
                    >
                      {viralLabel.label}
                    </span>
                  </div>
                </div>

                <div className="h-12 w-px bg-border/50" />

                {/* Performance Score Ring */}
                <div className="flex items-center gap-3">
                  <ScoreRing
                    score={video.performanceScore}
                    size="sm"
                    label="Perf"
                    variant="performance"
                    showAnimation={showAnimation}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Performance
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        performanceLabel.color === "emerald" && "text-emerald-500",
                        performanceLabel.color === "green" && "text-green-500",
                        performanceLabel.color === "yellow" && "text-yellow-500",
                        performanceLabel.color === "orange" && "text-orange-500",
                        performanceLabel.color === "red" && "text-red-500"
                      )}
                    >
                      {performanceLabel.label}
                    </span>
                  </div>
                </div>

                {/* Velocity indicator */}
                <div className="ml-auto flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Velocity
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {formatNumber(Math.round(video.velocity))}/day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricPill({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof IconEye;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs opacity-60">{label}</span>
    </div>
  );
}

function ScoreBadge({
  score,
  variant,
}: {
  score: number;
  variant: "viral" | "performance";
}) {
  const Icon = variant === "viral" ? IconFlame : IconChartBar;
  const colors =
    variant === "viral"
      ? "from-rose-500 to-orange-400"
      : "from-cyan-500 to-violet-500";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md",
        `bg-gradient-to-r ${colors}`
      )}
    >
      <Icon className="h-3 w-3" />
      {score.toFixed(0)}
    </div>
  );
}
