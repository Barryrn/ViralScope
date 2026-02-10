import { redirect } from "next/navigation";

interface AnalyticsPageProps {
  searchParams: Promise<{ channel?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const channel = params.channel;

  // Redirect to main YouTube page with insights tab
  if (channel) {
    // If there's a channel param, we need to handle it differently
    // For now, just redirect to YouTube page - the user can re-enter the channel
    redirect("/dashboard/youtube");
  }

  redirect("/dashboard/youtube");
}
