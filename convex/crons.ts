import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up old error logs daily at 3:00 AM UTC
// Removes error logs older than 30 days to prevent unbounded table growth
crons.daily(
  "cleanup old errors",
  { hourUTC: 3, minuteUTC: 0 },
  internal.errorLogging.cleanupOldErrors,
  { olderThanDays: 30 }
);

export default crons;
