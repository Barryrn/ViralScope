"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconFlame,
  IconChartBar,
  IconSettings,
  IconChevronDown,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useScoreWeights } from "@/lib/contexts/score-weights-context";
import { DEFAULT_WEIGHTS, type ScoreWeights } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface WeightConfigProps {
  className?: string;
}

export function WeightConfig({ className }: WeightConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { weights, updateWeights, resetToDefaults, isLoading, isCustom } =
    useScoreWeights();
  const [localWeights, setLocalWeights] = useState<ScoreWeights>(weights);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when remote weights change
  useEffect(() => {
    setLocalWeights(weights);
    setHasChanges(false);
  }, [weights]);

  // Independent slider changes (no auto-adjust)
  const handleViralChange = (
    key: keyof ScoreWeights["viral"],
    value: number
  ) => {
    setLocalWeights((prev) => ({
      ...prev,
      viral: { ...prev.viral, [key]: value },
    }));
    setHasChanges(true);
  };

  const handlePerfChange = (
    key: keyof ScoreWeights["performance"],
    value: number
  ) => {
    setLocalWeights((prev) => ({
      ...prev,
      performance: { ...prev.performance, [key]: value },
    }));
    setHasChanges(true);
  };

  // Validation
  const viralSum =
    localWeights.viral.velocity +
    localWeights.viral.engagement +
    localWeights.viral.comment;
  const perfSum =
    localWeights.performance.engagement + localWeights.performance.comment;
  const isViralValid = Math.abs(viralSum - 1) < 0.001;
  const isPerfValid = Math.abs(perfSum - 1) < 0.001;
  const canSave = isViralValid && isPerfValid && hasChanges;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await updateWeights(localWeights);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await resetToDefaults();
      setLocalWeights(DEFAULT_WEIGHTS);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-card shadow-sm",
          className
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <IconSettings className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Configure Score Weights</h3>
                <p className="text-xs text-muted-foreground">
                  {isCustom ? "Using custom weights" : "Using default weights"}
                </p>
              </div>
            </div>
            <IconChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-t border-border/50 p-4"
              >
                <div className="space-y-6">
                  {/* Viral Score Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconFlame className="h-4 w-4 text-rose-500" />
                        <span className="text-sm font-medium">
                          Viral Score Weights
                        </span>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-mono",
                          isViralValid
                            ? "text-emerald-600"
                            : "text-destructive"
                        )}
                      >
                        {isViralValid ? (
                          <IconCheck className="h-3 w-3" />
                        ) : (
                          <IconAlertTriangle className="h-3 w-3" />
                        )}
                        {Math.round(viralSum * 100)}%
                      </span>
                    </div>

                    <WeightSlider
                      label="Velocity"
                      value={localWeights.viral.velocity}
                      onChange={(v) => handleViralChange("velocity", v)}
                    />
                    <WeightSlider
                      label="Engagement"
                      value={localWeights.viral.engagement}
                      onChange={(v) => handleViralChange("engagement", v)}
                    />
                    <WeightSlider
                      label="Comments"
                      value={localWeights.viral.comment}
                      onChange={(v) => handleViralChange("comment", v)}
                    />

                    {!isViralValid && (
                      <p className="text-xs text-destructive">
                        Weights must sum to 100% (currently{" "}
                        {Math.round(viralSum * 100)}%)
                      </p>
                    )}
                  </div>

                  {/* Performance Score Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconChartBar className="h-4 w-4 text-cyan-500" />
                        <span className="text-sm font-medium">
                          Performance Score Weights
                        </span>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-mono",
                          isPerfValid
                            ? "text-emerald-600"
                            : "text-destructive"
                        )}
                      >
                        {isPerfValid ? (
                          <IconCheck className="h-3 w-3" />
                        ) : (
                          <IconAlertTriangle className="h-3 w-3" />
                        )}
                        {Math.round(perfSum * 100)}%
                      </span>
                    </div>

                    <WeightSlider
                      label="Engagement"
                      value={localWeights.performance.engagement}
                      onChange={(v) => handlePerfChange("engagement", v)}
                    />
                    <WeightSlider
                      label="Comments"
                      value={localWeights.performance.comment}
                      onChange={(v) => handlePerfChange("comment", v)}
                    />

                    {!isPerfValid && (
                      <p className="text-xs text-destructive">
                        Weights must sum to 100% (currently{" "}
                        {Math.round(perfSum * 100)}%)
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={isSaving || !isCustom}
                    >
                      <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!canSave || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function WeightSlider({ label, value, onChange }: WeightSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{percentage}%</span>
      </div>
      <Slider
        value={[percentage]}
        min={0}
        max={100}
        step={5}
        onValueChange={([v]) => onChange(v / 100)}
        className="w-full"
      />
    </div>
  );
}
