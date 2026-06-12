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
import { applicationSessionCache } from "@/utils/applicationSessionCache";

/* status */
const statusConfig = {
  SUBMITTED: { label: "Submitted", class: "bg-gray-100 text-gray-700" },
  AI_REVIEWED: { label: "AI Reviewed", class: "bg-blue-100 text-blue-700" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", class: "bg-purple-100 text-purple-700" },
  PHASE1_ACCEPTED: { label: "Phase 1 Accepted", class: "bg-green-100 text-green-700" },
  PHASE1_REJECTED: { label: "Phase 1 Rejected", class: "bg-red-100 text-red-700" },
};

/* normalize AI score */
const normalizeApp = (app) => ({
  ...app,
  aiScore: app.aiScore?.error
    ? { error: app.aiScore.error }
    : {
        final_score: app.aiScore?.final_score ?? null,
        per_criterion_scores: app.aiScore?.per_criterion_scores ?? {},
        justification: app.aiScore?.justification ?? {},
        recommendation: app.aiScore?.recommendation ?? "-",
        overall_summary: app.aiScore?.overall_summary ?? "",
      },
});

const ApplicationDetails = () => {
  const { id } = useParams();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchApp = async () => {
      try {
        setLoading(true);

        /* 1️⃣ check session cache */
        const cached = applicationSessionCache.get(id);
        if (cached) {
          setApp(normalizeApp(cached));
          setLoading(false);
          return;
        }

        /* 2️⃣ fetch from API */
        const data = await getApplication(id);

        /* 3️⃣ save to cache */
        applicationSessionCache.set(id, data);

        setApp(normalizeApp(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  /* loading */
  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!app) return <div>Application not found</div>;

  const ai = app.aiScore;

  return (
    <div className="space-y-5">

      {/* header */}
      <div className="flex justify-between items-center">
        <Link to="/executive/applications">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>

        <Badge className={statusConfig[app.status]?.class}>
          {statusConfig[app.status]?.label}
        </Badge>
      </div>

      {/* profile */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-5">

            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {getInitials(app.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold">{app.name}</h2>

              <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {app.email}
                </span>

                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {app.phone}
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {ai?.overall_summary || "No summary available"}
              </p>

              <div className="flex gap-2 mt-2">
                <a href={app.cvLink} target="_blank">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    CV
                  </Button>
                </a>

                <a href={app.linkedinLink} target="_blank">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    LinkedIn
                  </Button>
                </a>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">AI Score</p>
              <p className="text-3xl font-bold">
                {ai?.final_score ?? "-"}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* AI section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Review</CardTitle>
        </CardHeader>

        <CardContent>

          {/* error state */}
          {ai?.error ? (
            <p className="text-red-500 text-sm">{ai.error}</p>
          ) : (
            <>
              {/* summary */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="text-2xl font-bold">{ai.final_score}</p>
                </div>

                <Badge>{ai.recommendation}</Badge>
              </div>

              {/* breakdown */}
              <div className="mt-4 space-y-3">
                {Object.entries(ai.per_criterion_scores).map(
                  ([key, value]) => {
                    const score =
                      typeof value === "number"
                        ? value
                        : value?.sub_score ?? 0;

                    const justification =
                      typeof value === "object"
                        ? value?.justification
                        : ai.justification?.[key];

                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span>{score}</span>
                        </div>

                        <Progress value={score} className="h-2" />

                        {justification && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {justification}
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetails;