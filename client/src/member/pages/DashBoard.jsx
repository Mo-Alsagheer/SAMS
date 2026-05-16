import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Video,
  User,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import StatCard from "@/components/shared/StatCard";

import { committee, sessions } from "@/data/mock-data";

/* =========================
   DERIVED DATA
========================= */

const tasks = sessions.flatMap((s) => s.tasks || []);

const stats = {
  completedSessions: sessions.filter((s) => s.status === "completed").length,

  pendingTasks: tasks.filter((t) => t.status === "pending").length,

  attendanceRate: Math.round(
    (sessions.filter((s) => s.attended).length / sessions.length) * 100,
  ),
};

const upcomingSession =
  sessions.find((s) => s.status === "live") ||
  sessions.find((s) => s.status === "upcoming");

const latest = tasks.slice(0, 3);

const isLive = upcomingSession?.status === "live";

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
   BADGES
========================= */

function TaskStatusBadge({ status }) {
  const styles = {
    pending: "bg-warning/15 text-warning-foreground border border-warning/30",

    submitted: "bg-info/15 text-info border border-info/30",

    graded: "bg-success/15 text-success border border-success/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your learning journey today.
        </p>
      </div>
      {/* Committee Overview */}
      <Card className="mb-8 border-border/60">
        <CardContent className="flex flex-col gap-6  lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Committee
            </div>

            <div>
              <h2 className="text-2xl font-bold">{committee.name}</h2>

              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                {committee.description}
              </p>
            </div>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex flex-col gap-4 border-t border-border/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Director */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">
                {committee.director}
              </span>{" "}
              • Director
            </span>
          </div>

          {/* Sessions */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>
              <span className="font-medium text-foreground">
                {committee.totalSessions}
              </span>{" "}
              Sessions
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              to="/member/tasks"
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

                  {t.score !== undefined && (
                    <span className="text-xs font-semibold text-success">
                      {t.score}/{t.maxScore}
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
