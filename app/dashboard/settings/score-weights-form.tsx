"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  TrendingUp,
  MessageCircle,
  Zap,
  RotateCcw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useScoreWeights } from "@/lib/contexts/score-weights-context";
import { DEFAULT_WEIGHTS, type ScoreWeights } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface WeightSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

function WeightSlider({
  label,
  icon,
  value,
  onChange,
  color,
}: WeightSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground text-sm font-mono">
          {percentage}%
        </span>
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

export function ScoreWeightsForm() {
  const { weights, isLoading, isCustom, updateWeights, resetToDefaults } =
    useScoreWeights();

  // Local state for form editing
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Viral Score Weights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-rose-500" />
              Viral Score Weights
            </CardTitle>
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-mono",
                isViralValid ? "text-emerald-600" : "text-destructive"
              )}
            >
              {isViralValid ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {Math.round(viralSum * 100)}%
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Adjust how each metric contributes to the Viral Score. Weights must
            sum to 100%.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <WeightSlider
            label="Velocity"
            icon={<Zap className="h-4 w-4" />}
            value={localWeights.viral.velocity}
            onChange={(v) => handleViralChange("velocity", v)}
            color="text-amber-500"
          />
          <WeightSlider
            label="Engagement Rate"
            icon={<TrendingUp className="h-4 w-4" />}
            value={localWeights.viral.engagement}
            onChange={(v) => handleViralChange("engagement", v)}
            color="text-emerald-500"
          />
          <WeightSlider
            label="Comment Rate"
            icon={<MessageCircle className="h-4 w-4" />}
            value={localWeights.viral.comment}
            onChange={(v) => handleViralChange("comment", v)}
            color="text-blue-500"
          />
          {!isViralValid && (
            <p className="text-sm text-destructive">
              Weights must sum to 100% (currently {Math.round(viralSum * 100)}%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance Score Weights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Performance Score Weights
            </CardTitle>
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-mono",
                isPerfValid ? "text-emerald-600" : "text-destructive"
              )}
            >
              {isPerfValid ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {Math.round(perfSum * 100)}%
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Adjust how each metric contributes to the Performance Score. Weights
            must sum to 100%.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <WeightSlider
            label="Engagement Rate"
            icon={<TrendingUp className="h-4 w-4" />}
            value={localWeights.performance.engagement}
            onChange={(v) => handlePerfChange("engagement", v)}
            color="text-emerald-500"
          />
          <WeightSlider
            label="Comment Rate"
            icon={<MessageCircle className="h-4 w-4" />}
            value={localWeights.performance.comment}
            onChange={(v) => handlePerfChange("comment", v)}
            color="text-blue-500"
          />
          {!isPerfValid && (
            <p className="text-sm text-destructive">
              Weights must sum to 100% (currently {Math.round(perfSum * 100)}%)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCustom && (
            <span className="text-muted-foreground text-xs">
              Using custom weights
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || !isCustom}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
