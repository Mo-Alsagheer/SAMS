import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getSessions } from "@/features/sessions/sessions";
import { Spinner } from "@/components/ui/spinner";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function RoadmapSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      <div className="mb-4 space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="relative">
        <div className="absolute bottom-2 left-5 top-2 w-px bg-border md:left-6" />

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative pl-14 md:pl-16">
              <Skeleton className="absolute left-0 top-2 h-10 w-10 rounded-full md:h-12 md:w-12" />

              <Card>
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </div>

                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />

                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>

                  <Skeleton className="h-10 w-32 rounded-md" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  if (loading) {
    return <RoadmapSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Learning Journey</h2>

          <p className="text-sm text-muted-foreground">
            Follow the committee roadmap sessions.
          </p>
        </div>

        <div className="relative">
          <div className="absolute bottom-2 left-5 top-2 w-px bg-border md:left-6" />

          <ol className="space-y-4">
            {sessions.map((session, index) => (
              <li key={session.id} className="relative pl-14 md:pl-16">
                <div className="absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-primary md:h-12 md:w-12">
                  <PlayCircle className="h-5 w-5" />
                </div>

                <Card>
                  <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Session {index + 1}
                        </span>

                        {/* <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary"
                        >
                          Available
                        </Badge> */}

                        {session.isRecorded && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700"
                          >
                            Recorded
                          </Badge>
                        )}
                      </div>

                      <h3 className="mt-1 text-lg font-semibold">
                        {session.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {session.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    <Button asChild>
                      <Link to={`../session/${session.id}`}>
                        View Session
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
