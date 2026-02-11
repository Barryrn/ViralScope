"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VideoData } from "@/convex/youtubeTypes";
import { useState } from "react";

interface SaveButtonProps {
  video: VideoData;
  className?: string;
  variant?: "icon" | "button";
}

export function SaveButton({
  video,
  className,
  variant = "icon",
}: SaveButtonProps) {
  const isSaved = useQuery(api.savedVideos.isSaved, { videoId: video.id });
  const save = useMutation(api.savedVideos.save);
  const unsave = useMutation(api.savedVideos.unsave);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isSaved) {
        await unsave({ videoId: video.id });
      } else {
        await save({
          videoData: {
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl,
            channelId: video.channelId,
            channelTitle: video.channelTitle,
            publishedAt: video.publishedAt,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            commentCount: video.commentCount,
            duration: video.duration,
            tags: video.tags,
          },
        });
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <Button
        variant={isSaved ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading || isSaved === undefined}
        className={cn("gap-2", className)}
      >
        {isSaved ? (
          <>
            <IconBookmarkFilled className="h-4 w-4" />
            Saved
          </>
        ) : (
          <>
            <IconBookmark className="h-4 w-4" />
            Save
          </>
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isSaved === undefined}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-all",
        isSaved
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-black/50 text-white hover:bg-black/70",
        isLoading && "cursor-not-allowed opacity-50",
        className
      )}
      aria-label={isSaved ? "Remove from saved" : "Save video"}
    >
      {isSaved ? (
        <IconBookmarkFilled className="h-4 w-4" />
      ) : (
        <IconBookmark className="h-4 w-4" />
      )}
    </button>
  );
}
