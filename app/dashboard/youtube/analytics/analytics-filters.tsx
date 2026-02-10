"use client";

import { motion } from "motion/react";
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Video Type Tabs */}
      <Tabs value={videoType} onValueChange={(v) => onVideoTypeChange(v as VideoType)}>
        <TabsList className="h-10 bg-muted/50 p-1">
          <TabsTrigger
            value="all"
            className="gap-1.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <IconLayoutGrid className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger
            value="short"
            className="gap-1.5 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <IconBolt className="h-4 w-4" />
            Shorts
          </TabsTrigger>
          <TabsTrigger
            value="long"
            className="gap-1.5 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <IconPlayerPlay className="h-4 w-4" />
            Long Videos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Row */}
      <div className="flex items-center gap-3">
        {/* Timeframe Select */}
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeframe} onValueChange={(v) => onTimeframeChange(v as TimeframeValue)}>
            <SelectTrigger className="w-[140px] border-border/50 bg-muted/30">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border/50" />

        {/* Sort By Toggle */}
        <div className="flex items-center gap-2">
          <IconArrowsSort className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <button
              onClick={() => onSortByChange("viral")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                sortBy === "viral"
                  ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconFlame className="h-3.5 w-3.5" />
              Viral
            </button>
            <button
              onClick={() => onSortByChange("performance")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                sortBy === "performance"
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <IconChartBar className="h-3.5 w-3.5" />
              Performance
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
