import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSessions } from "@/features/sessions/sessions";
import { getSessionTasks } from "@/features/tasks/tasks";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  submitted: "bg-primary/10 text-primary border-primary/20",
  graded: "bg-success/15 text-success border-success/30",
};
export default function Tasks() {
  const [sessionsData, setSessionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSessions();
        if (!Array.isArray(data)) {
          if (mounted) setSessionsData([]);
        } else {
          const sessionsWithTasks = await Promise.all(
            data.map(async (s) => {
              const sessionId = s.id ?? s._id;
              try {
                const tasks = await getSessionTasks(sessionId);
                return { ...s, tasks: tasks || s.tasks || [] };
              } catch (e) {
                return { ...s, tasks: s.tasks || [] };
              }
            }),
          );
          if (mounted) setSessionsData(sessionsWithTasks);
        }
      } catch (err) {
        if (mounted) setSessionsData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const tasks = sessionsData.flatMap((s) =>
    (s.tasks || []).map((t) => ({ ...t, sessionTitle: s.title })),
  );

  const groups = {
    pending: tasks.filter((t) => t.status === "pending"),
    submitted: tasks.filter((t) => t.status === "submitted"),
    graded: tasks.filter((t) => t.status === "graded"),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">
          All assignments across the committee.
        </p>
      </div>

      {["pending", "submitted", "graded"].map((key) => (
        <section key={key}>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold capitalize">{key}</h2>
            <Badge variant="secondary">{groups[key].length}</Badge>
          </div>
          <div className="grid gap-3">
            {groups[key].length === 0 && (
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : "Nothing here yet."}
              </p>
            )}
            {groups[key].map((t) => (
              <Card
                key={t.id}
                className="transition-smooth hover:shadow-elegant"
              >
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{t.title}</h3>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusStyles[t.status])}
                      >
                        {t.status}
                      </Badge>
                      {t.status === "graded" && (
                        <Badge className="bg-gradient-primary text-primary-foreground border-0">
                          {t.score}/{t.maxScore} pts
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {t.description}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span>{t.sessionTitle}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Due {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
