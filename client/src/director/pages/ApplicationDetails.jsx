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

const verdictConfig = {
  strong_fit: "bg-green-100 text-green-700",
  possible_fit: "bg-yellow-100 text-yellow-700",
  weak_fit: "bg-red-100 text-red-700",
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
      <div>
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Skeleton className="h-6 w-32 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>

          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col md:flex-row gap-5">
                <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
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
    <div>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link to="/director/applications">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
          </Link>

          <Badge
            variant="outline"
            className={`${statusConfig[app.status]?.class} text-sm px-3 py-1`}
          >
            {statusConfig[app.status]?.label}
          </Badge>
        </div>

        {/* Applicant Info */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row gap-5">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials(app.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold">{app.name}</h2>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {app.email}
                    </span>

                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {app.phone}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {app.bio ?? app.aiScore?.profile_summary}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <a
                    href={app.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      View CV
                    </Button>
                  </a>

                  <a
                    href={app.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground mb-1">
                  AI Final Score
                </p>

                <p className="text-4xl font-bold text-primary">
                  {app.aiScore?.overall ?? "-"}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  Role: {app.targetRole}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Review */}
        {app.aiScore && (
          <Card>
            <CardHeader>
              <CardTitle>AI Review</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score + Verdict */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Final Score</p>

                  <p className="text-3xl font-bold text-primary">
                    {app.aiScore.overall}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Verdict
                  </p>

                  <Badge
                    className={
                      verdictConfig[app.aiScore.verdict] ||
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {app.aiScore.verdict?.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-4">
                {Object.entries(app.aiScore.scores || {}).map(
                  ([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>

                        <span>{value}</span>
                      </div>

                      <Progress value={value} className="h-2" />
                    </div>
                  ),
                )}
              </div>

              {/* Summary */}
              {app.aiScore.profile_summary && (
                <div>
                  <h3 className="font-semibold mb-2">Profile Summary</h3>

                  <p className="text-sm text-muted-foreground">
                    {app.aiScore.profile_summary}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {app.aiScore.key_strengths?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Strengths</h3>

                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {app.aiScore.key_strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {app.aiScore.gaps?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Areas for Improvement
                  </h3>

                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {app.aiScore.gaps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {app.aiScore.recommendation && (
                <div>
                  <h3 className="font-semibold mb-2">Recommendation</h3>

                  <p className="text-sm text-muted-foreground">
                    {app.aiScore.recommendation}
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