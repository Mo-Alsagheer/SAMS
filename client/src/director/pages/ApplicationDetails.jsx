import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getApplication } from "@/features/applications/applications";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  PauseCircle,
  User,
  Mail,
  Clock,
  Phone,
} from "lucide-react";
import { getInitials } from "@/utils/getInitials";

const statusConfig = {
  SUBMITTED: {
    label: "Submitted",
    class: "bg-gray-100 text-gray-700",
  },
  AI_REVIEWED: {
    label: "AI Reviewed",
    class: "bg-blue-100 text-blue-700",
  },
  INTERVIEW_SCHEDULED: {
    label: "Interview Scheduled",
    class: "bg-purple-100 text-purple-700",
  },
  PHASE1_ACCEPTED: {
    label: "Phase 1 Accepted",
    class: "bg-green-100 text-green-700",
  },
  PHASE1_REJECTED: {
    label: "Phase 1 Rejected",
    class: "bg-red-100 text-red-700",
  },
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      try {
        const data = await getApplication(id);
        setApp(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  if (loading)
    return (
      <div className="">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col md:flex-row gap-5">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-4 md:flex-col md:items-end shrink-0">
                  <div className="text-center">
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  if (!app) return <div>Application not found</div>;
  return (
    <div className="">
      <div className="space-y-5">
        {/* Back + Decision bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link to="/director/applications">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Applications
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={statusConfig[app.status]?.class + " text-sm px-3 py-1"}
            >
              {statusConfig[app.status]?.label}
            </Badge>
            {/* <Button
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground gap-1.5"
            >
              <CheckCircle className="h-4 w-4" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
            >
              <XCircle className="h-4 w-4" /> Reject
            </Button> */}
          </div>
        </div>

        {/* Applicant profile card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row gap-5">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-display font-bold">
                  {getInitials(app.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-display font-bold">{app.name}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {app.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {app.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {app.bio ?? app.aiScore?.overall_summary}
                </p>
                <div className="flex gap-2">
                  <a
                    href={app.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> View CV
                    </Button>
                  </a>
                  <a
                    href={app.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" /> LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex gap-4 md:flex-col md:items-end shrink-0">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    AI Final Score
                  </p>
                  <p className="text-3xl font-display font-bold text-primary">
                    {app.aiScore?.final_score ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role: {app.targetRole}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Review Breakdown */}
        {app.aiScore && (
          <Card>
            <CardHeader>
              <CardTitle>AI Review</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-display font-bold text-primary">
                    {app.aiScore.final_score ?? "-"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Recommendation
                  </p>
                  <Badge className="px-3 py-1 mt-1">
                    {app.aiScore.recommendation ?? "N/A"}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {app.aiScore.per_criterion_scores &&
                  Object.entries(app.aiScore.per_criterion_scores).map(
                    ([key, value]) => {
                      const score =
                        typeof value === "number"
                          ? value
                          : (value?.sub_score ?? 0);

                      const justification =
                        typeof value === "object"
                          ? value?.justification
                          : app.aiScore?.justification?.[key];

                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span>{score}</span>
                          </div>

                          <Progress value={score} className="h-2 mt-1" />

                          {justification && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {justification}
                            </p>
                          )}
                        </div>
                      );
                    },
                  )}
              </div>

              {app.aiScore.overall_summary && (
                <div className="mt-5">
                  <p className="text-sm font-semibold">Summary</p>
                  <p className="text-sm text-muted-foreground">
                    {app.aiScore.overall_summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails;
