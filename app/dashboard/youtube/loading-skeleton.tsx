"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type: "video" | "channel" | "search";
}

export function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === "video") {
    return <VideoSkeleton />;
  }

  if (type === "channel") {
    return <ChannelSkeleton />;
  }

  return <SearchSkeleton />;
}

function VideoSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50">
      <div className="grid gap-6 md:grid-cols-[400px_1fr]">
        {/* Thumbnail skeleton */}
        <div className="relative aspect-video md:aspect-auto md:h-full">
          <Skeleton className="absolute inset-0" />
        </div>

        {/* Content skeleton */}
        <div className="flex flex-col p-6 md:py-6 md:pr-6 md:pl-0">
          {/* Title */}
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="mt-2 h-7 w-1/2" />

          {/* Channel info */}
          <div className="mt-3 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Metrics grid */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 p-3 text-center">
                <Skeleton className="mx-auto mb-2 h-5 w-5" />
                <Skeleton className="mx-auto h-6 w-16" />
                <Skeleton className="mx-auto mt-1 h-3 w-12" />
              </div>
            ))}
          </div>

          {/* Engagement rate */}
          <div className="mt-4 rounded-xl border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4">
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ChannelSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50">
      {/* Header */}
      <Skeleton className="h-32 w-full rounded-none" />

      {/* Profile section */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-card" />
        </div>

        {/* Channel name */}
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-24" />

        {/* Description */}
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-4 text-center">
              <Skeleton className="mx-auto mb-2 h-5 w-5" />
              <Skeleton className="mx-auto h-7 w-20" />
              <Skeleton className="mx-auto mt-1 h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Join date */}
        <Skeleton className="mt-6 h-4 w-36" />
      </div>
    </Card>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {/* Results header */}
      <Skeleton className="h-4 w-32" />

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-border/50 bg-card/50">
            {/* Thumbnail */}
            <Skeleton className="aspect-video w-full rounded-none" />

            {/* Content */}
            <div className="p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
              <div className="mt-3 flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
