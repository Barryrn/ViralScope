"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconExternalLink,
  IconUser,
  IconSearch,
} from "@tabler/icons-react";
import { timeAgo } from "@/lib/youtube-utils";
import type { SearchResult, SearchResultVideo } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface SearchResultsProps {
  data: SearchResult;
  className?: string;
}

export function SearchResults({ data, className }: SearchResultsProps) {
  if (data.videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <IconSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">
          No results found
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
          Try a different search query to find videos
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found{" "}
          <span className="font-medium text-foreground">
            {data.totalResults.toLocaleString()}
          </span>{" "}
          results
        </p>
        {data.nextPageToken && (
          <Badge variant="outline" className="text-xs">
            More results available
          </Badge>
        )}
      </div>

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.videos.map((video, index) => (
          <SearchResultCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  video: SearchResultVideo;
  index: number;
}

function SearchResultCard({ video, index }: SearchResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.05,
      }}
    >
      <a
        href={`https://youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <Card className="overflow-hidden border-border/50 bg-card/50 transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Play icon on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                <svg
                  className="h-5 w-5 translate-x-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* External link indicator */}
            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <IconExternalLink className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-red-500">
              {video.title}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <IconUser className="h-3.5 w-3.5" />
              <span className="truncate">{video.channelTitle}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="shrink-0">{timeAgo(video.publishedAt)}</span>
            </div>
          </div>
        </Card>
      </a>
    </motion.div>
  );
}
