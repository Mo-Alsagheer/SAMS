import { committee, sessions, getScore } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Trophy,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// export const Route = createFileRoute("/_member/committee/$id/roadmap")({
//   head: () => ({
//     meta: [
//       { title: "Roadmap — SAMS Learning Hub" },
//       {
//         name: "description",
//         content:
//           "Your committee's learning journey: sessions, tasks, and milestones.",
//       },
//     ],
//   }),
//   component: Roadmap,
// });

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function statusIcon(status) {
  if (status === "completed") return CheckCircle2;
  if (status === "live") return PlayCircle;
  if (status === "locked") return Lock;
  return Circle;
}

function statusBadge(status) {
  const map = {
    completed: {
      label: "Completed",
      className: "bg-success/15 text-success border-success/20",
    },
    live: {
      label: "Live now",
      className:
        "bg-destructive/15 text-destructive border-destructive/20 animate-pulse",
    },
    upcoming: {
      label: "Upcoming",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    locked: {
      label: "Locked",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  const cfg = map[status] ?? map.upcoming;

  return (
    <Badge variant="outline" className={cn("font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export default function Roadmap() {
  const score = getScore();

  const completed = sessions.filter((s) => s.status === "completed").length;

  const progress = Math.round((completed / sessions.length) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      {/* Hero */}
      {/* <section className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground shadow-elegant md:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Badge className="mb-4 border-white/20 bg-white/15 text-primary-foreground hover:bg-white/20">
            <Sparkles className="mr-1 h-3 w-3" />
            Active Committee
          </Badge>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {committee.name}
          </h1>

          <p className="mt-3 max-w-2xl text-primary-foreground/80">
            {committee.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 opacity-80" />
              Director:
              <span className="font-medium">{committee.director}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-80" />
              {sessions.length} sessions
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 opacity-80" />
              {score.total} / {score.max} pts
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <div className="mb-2 flex justify-between text-xs text-primary-foreground/80">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* Stat cards */}
      {/* <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={CheckCircle2}
          label="Sessions Completed"
          value={`${completed}/${sessions.length}`}
        />

        <StatCard
          icon={Trophy}
          label="Total Score"
          value={`${score.total}`}
          sub={`of ${score.max}`}
        />

        <StatCard
          icon={BookOpen}
          label="Pending Tasks"
          value={String(
            sessions
              .flatMap((s) => s.tasks)
              .filter((t) => t.status === "pending").length,
          )}
        />
      </section> */}

      {/* Timeline */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Learning Journey</h2>

            <p className="text-sm text-muted-foreground">
              Follow the path. Each session unlocks new tasks and points.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute bottom-2 left-5 top-2 w-px bg-border md:left-6" />

          <ol className="space-y-4">
            {sessions.map((s) => {
              const Icon = statusIcon(s.status);

              const isLocked = s.status === "locked";

              return (
                <li key={s.id} className="relative pl-14 md:pl-16">
                  <div
                    className={cn(
                      "absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 md:h-12 md:w-12",
                      s.status === "completed" &&
                        "border-success bg-success text-success-foreground",
                      s.status === "live" &&
                        "border-destructive bg-destructive text-destructive-foreground shadow-glow",
                      s.status === "upcoming" &&
                        "border-primary bg-background text-primary",
                      s.status === "locked" &&
                        "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <Card
                    className={cn(
                      "transition-smooth hover:shadow-elegant",
                      isLocked && "opacity-60",
                    )}
                  >
                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Session {s.order}
                          </span>

                          {statusBadge(s.status)}

                          {s.attended && (
                            <Badge
                              variant="outline"
                              className="border-success/30 bg-success/10 text-success"
                            >
                              Attended
                            </Badge>
                          )}
                        </div>

                        <h3 className="mt-1 text-lg font-semibold">
                          {s.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {s.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(s.date)}
                          </span>

                          <span>{s.duration}</span>

                          {s.tasks.length > 0 && (
                            <span>{s.tasks.length} task(s)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!isLocked && (
                          <Button
                            asChild
                            variant={
                              s.status === "live" ? "default" : "outline"
                            }
                          >
                            <Link to={`../session/${s.id}`}>
                              {s.status === "live" ? "Join now" : "View"}

                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="transition-smooth hover:shadow-elegant">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <div className="text-sm text-muted-foreground">{label}</div>

          <div className="text-2xl font-bold">
            {value}

            {sub && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {sub}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
