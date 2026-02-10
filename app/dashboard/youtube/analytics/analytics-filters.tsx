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
} from "@tabler/icons-react";
import { TIMEFRAME_OPTIONS, SORT_OPTIONS, type TimeframeValue, type VideoType, type SortOption } from "@/lib/analytics-utils";

interface AnalyticsFiltersProps {
  videoType: VideoType;
  onVideoTypeChange: (type: VideoType) => void;
  timeframe: TimeframeValue;
  onTimeframeChange: (timeframe: TimeframeValue) => void;
  sortBy: SortOption;
  onSortByChange: (sortBy: SortOption) => void;
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

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <IconArrowsSort className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortOption)}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
