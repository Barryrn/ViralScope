"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconLayoutGrid,
  IconBolt,
  IconPlayerPlay,
  IconCalendar,
  IconArrowsSort,
  IconFlame,
  IconChartBar,
} from "@tabler/icons-react";
import { TIMEFRAME_OPTIONS, type TimeframeValue, type VideoType } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersProps {
  videoType: VideoType;
  onVideoTypeChange: (type: VideoType) => void;
  timeframe: TimeframeValue;
  onTimeframeChange: (timeframe: TimeframeValue) => void;
  sortBy: "viral" | "performance";
  onSortByChange: (sortBy: "viral" | "performance") => void;
}

export function AnalyticsFilters({
  videoType,
  onVideoTypeChange,
  timeframe,
  onTimeframeChange,
  sortBy,
  onSortByChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Video Type Tabs */}
      <Tabs value={videoType} onValueChange={(v) => onVideoTypeChange(v as VideoType)}>
        <TabsList className="h-9 bg-muted/50 p-1">
          <TabsTrigger
            value="all"
            className="gap-1.5 px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <IconLayoutGrid className="h-3.5 w-3.5" />
            All
          </TabsTrigger>
          <TabsTrigger
            value="short"
            className="gap-1.5 px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <IconBolt className="h-3.5 w-3.5" />
            Shorts
          </TabsTrigger>
          <TabsTrigger
            value="long"
            className="gap-1.5 px-3 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <IconPlayerPlay className="h-3.5 w-3.5" />
            Long
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Timeframe Select */}
        <div className="flex items-center gap-2">
          <IconCalendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as TimeframeValue)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border" />

        {/* Sort By Toggle */}
        <div className="flex items-center gap-2">
          <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex rounded-lg border border-border/50 bg-muted/50 p-0.5">
            <button
              onClick={() => onSortByChange("viral")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                sortBy === "viral"
                  ? "bg-card text-rose-600 shadow-sm dark:text-rose-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconFlame className="h-3 w-3" />
              Viral
            </button>
            <button
              onClick={() => onSortByChange("performance")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                sortBy === "performance"
                  ? "bg-card text-cyan-600 shadow-sm dark:text-cyan-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconChartBar className="h-3 w-3" />
              Performance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
