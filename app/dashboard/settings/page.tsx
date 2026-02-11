"use client";

import { ScoreWeightsForm } from "./score-weights-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize how your scores are calculated
        </p>
      </div>

      <ScoreWeightsForm />
    </div>
  );
}
