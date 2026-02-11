"use client";

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DEFAULT_WEIGHTS, type ScoreWeights } from "@/lib/analytics-utils";

interface ScoreWeightsContextValue {
  weights: ScoreWeights;
  isLoading: boolean;
  isCustom: boolean;
  updateWeights: (weights: ScoreWeights) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const ScoreWeightsContext = createContext<ScoreWeightsContextValue | null>(
  null
);

export function ScoreWeightsProvider({ children }: { children: ReactNode }) {
  const savedWeights = useQuery(api.userSettings.get);
  const upsertMutation = useMutation(api.userSettings.upsert);
  const resetMutation = useMutation(api.userSettings.reset);

  const isLoading = savedWeights === undefined;

  const weights = useMemo<ScoreWeights>(() => {
    if (savedWeights === null || savedWeights === undefined) {
      return DEFAULT_WEIGHTS;
    }
    return savedWeights;
  }, [savedWeights]);

  const isCustom = savedWeights !== null && savedWeights !== undefined;

  const updateWeights = useCallback(
    async (newWeights: ScoreWeights) => {
      await upsertMutation({
        viralVelocityWeight: newWeights.viral.velocity,
        viralEngagementWeight: newWeights.viral.engagement,
        viralCommentWeight: newWeights.viral.comment,
        perfEngagementWeight: newWeights.performance.engagement,
        perfCommentWeight: newWeights.performance.comment,
      });
    },
    [upsertMutation]
  );

  const resetToDefaults = useCallback(async () => {
    await resetMutation({});
  }, [resetMutation]);

  const value = useMemo<ScoreWeightsContextValue>(
    () => ({
      weights,
      isLoading,
      isCustom,
      updateWeights,
      resetToDefaults,
    }),
    [weights, isLoading, isCustom, updateWeights, resetToDefaults]
  );

  return (
    <ScoreWeightsContext.Provider value={value}>
      {children}
    </ScoreWeightsContext.Provider>
  );
}

export function useScoreWeights(): ScoreWeightsContextValue {
  const context = useContext(ScoreWeightsContext);
  if (!context) {
    throw new Error(
      "useScoreWeights must be used within a ScoreWeightsProvider"
    );
  }
  return context;
}
