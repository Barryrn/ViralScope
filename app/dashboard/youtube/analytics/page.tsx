import { Suspense } from "react";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { IconLoader2 } from "@tabler/icons-react";

function AnalyticsLoading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 lg:px-6">
      <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading analytics...</p>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
