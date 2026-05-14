import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import StatCard from "@/components/shared/StatCard";

/* =========================
   MOCK DATA (merged here)
========================= */

const sessions = [
  {
    id: "1",
    title: "Intro to React",
    date: "2025-04-01T18:00:00",
    description: "Components, JSX, and the React mental model.",
    status: "Done",
  },
  {
    id: "2",
    title: "Hooks Deep Dive",
    date: "2025-04-08T18:00:00",
    description: "useState, useEffect, custom hooks, and patterns.",
    status: "Done",
  },
  {
    id: "3",
    title: "APIs Integration",
    date: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    description:
      "Fetching, caching, and managing async state with React Query.",
    status: "Live",
  },
  {
    id: "4",
    title: "State Management",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    description: "Zustand, Context, and when to reach for each.",
    status: "Upcoming",
  },
];

const tasks = [
  {
    id: "t1",
    title: "Build a Counter Component",
    sessionId: "1",
    status: "Graded",
    grade: "5/5",
  },
  {
    id: "t2",
    title: "Custom Hook Challenge",
    sessionId: "2",
    status: "Submitted",
  },
  {
    id: "t3",
    title: "Build a Navbar",
    sessionId: "3",
    status: "Pending",
  },
  {
    id: "t4",
    title: "Form Validation",
    sessionId: "2",
    status: "Pending",
  },
];

const stats = {
  completedSessions: sessions.filter((s) => s.status === "Done").length,
  pendingTasks: tasks.filter((t) => t.status === "Pending").length,
  attendanceRate: 92,
};

const upcomingSession =
  sessions.find((s) => s.status === "Live") ||
  sessions.find((s) => s.status === "Upcoming");

/* =========================
   HOOK
========================= */

function useCountdown(target) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) return null;

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return "Live now";

  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1000);

  return `${h}h ${m}m ${s}s`;
}

/* =========================
   BADGES (merged here)
========================= */

function TaskStatusBadge({ status }) {
  const map = {
    Pending: "bg-warning/15 text-warning-foreground border border-warning/30",
    Submitted: "bg-info/15 text-info border border-info/30",
    Graded: "bg-success/15 text-success border border-success/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status],
      )}
    >
      {status}
    </span>
  );
}

/* =========================
   DASHBOARD
========================= */

export default function Dashboard() {
  const countdown = useCountdown(upcomingSession?.date);
  const isLive = upcomingSession?.status?.toLowerCase() === "live";
  const latest = tasks.slice(0, 3);

  const statCards = [
    {
      label: "Completed Sessions",
      value: stats.completedSessions,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted/40",
    },
    {
      label: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, name
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your learning journey today.
        </p>
      </div>

      {/* Stats */}
      <div className="">
        <div className="grid grid-cols-3">
          <StatCard
            title="Completed Sessions"
            value={stats.completedSessions}
            icon={CheckCircle2}
            color="success"
          />

          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon={Clock}
            color="warning"
          />

          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={TrendingUp}
            color="primary"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Next Session */}
        <Card className="lg:col-span-2 overflow-hidden border-0 text-primary shadow-elegant">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90">
              <Calendar className="h-4 w-4" />
              Next Session
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              {upcomingSession?.title}
            </h2>

            <p className="mt-2 text-sm opacity-90">
              {upcomingSession?.date &&
                new Date(upcomingSession.date).toLocaleString()}
            </p>

            {countdown && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
                <Clock className="h-4 w-4" />
                {countdown}
              </div>
            )}

            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isLive}
                variant="secondary"
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                {isLive ? "Join Live Session" : "Join when active"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Tasks</CardTitle>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>

          <CardContent className="space-y-3">
            {latest.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border/60 p-3 hover:bg-accent/40"
              >
                <p className="line-clamp-1 text-sm font-medium">{t.title}</p>

                <div className="mt-2 flex items-center justify-between">
                  <TaskStatusBadge status={t.status} />

                  {t.grade && (
                    <span className="text-xs font-semibold text-success">
                      {t.grade}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
