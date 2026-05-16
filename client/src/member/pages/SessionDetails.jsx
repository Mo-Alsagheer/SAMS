import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { getSession } from "@/data/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  Upload,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resourceIcon(type) {
  if (type === "video") return Video;
  if (type === "link") return LinkIcon;
  return FileText;
}

export default function SessionDetails() {
  function handleJoin() {
    toast.success("Redirecting to meeting...");

    // mock redirect
    setTimeout(() => {
      window.location.href = "https://your-plugnmeet-url.com";
    }, 800);
  }
  const { sessionId } = useParams();
  const session = getSession(sessionId);

  if (!session) {
    return <div>Session not found</div>;
  }
  const isLive = session.status === "live";
  const canJoin = isLive && session.meetingActive;
  // useEffect(() => {
  //   fetch(`/api/sessions/${sessionId}`)
  // })
  return (
    <div className="mx-auto max-w-5xl px-4  md:px-8">
      {/* <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="..">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button> */}

      {/* Hero card */}
      <Card className="overflow-hidden border-0 shadow-elegant">
        <div className="relative bg-gradient-primary p-6 text-primary-foreground md:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/80 border-white/20 text-white">
                Session {session.order}
              </Badge>
              {isLive && (
                <Badge className="bg-destructive border-destructive text-destructive-foreground animate-pulse">
                  Live now
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              {session.title}
            </h1>
            <p className="mt-2 max-w-2xl text-primary-foreground/85">
              {session.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDateTime(session.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {session.duration}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                size="lg"
                variant="secondary"
                disabled={!canJoin}
                onClick={handleJoin}
                className="bg-white text-primary hover:bg-white/90"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {canJoin
                  ? "Join meeting"
                  : isLive
                    ? "Meeting starting..."
                    : "Meeting not started"}
              </Button>
              {session.recordingUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Video className="mr-2 h-5 w-5" />
                  Watch recording
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 md:col-span-2">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tasks</span>
                <Badge variant="secondary">{session.tasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tasks assigned for this session.
                </p>
              )}
              {session.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session.resources.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No materials uploaded.
                </p>
              )}
              {session.resources.map((r) => {
                const Icon = resourceIcon(r.type);
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-smooth hover:border-primary/40 hover:bg-accent/50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {r.name}
                      </div>
                      {r.size && (
                        <div className="text-xs text-muted-foreground">
                          {r.size}
                        </div>
                      )}
                    </div>
                    {r.type === "link" ? (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Download className="h-4 w-4 text-muted-foreground" />
                    )}
                  </a>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task }) {
  const [open, setOpen] = useState(task.status === "pending");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const statusMap = {
    pending: {
      label: "Pending",
      className: "bg-warning/15 text-warning-foreground border-warning/30",
    },
    submitted: {
      label: "Submitted",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    graded: {
      label: "Graded",
      className: "bg-success/15 text-success border-success/30",
    },
  };
  const cfg = statusMap[task.status];

  function submit() {
    if (!text && !file) {
      toast.error("Please add text or attach a file.");
      return;
    }
    toast.success("Submission uploaded", {
      description: "Your work has been sent to the director.",
    });
    setOpen(false);
  }

  return (
    <div className="rounded-lg border border-border p-4 transition-smooth hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{task.title}</h4>
            <Badge
              variant="outline"
              className={cn("font-medium", cfg.className)}
            >
              {cfg.label}
            </Badge>
            {task.status === "graded" && (
              <Badge className="bg-gradient-primary text-primary-foreground border-0">
                {task.score}/{task.maxScore} pts
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {task.description}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </div>
        {task.status === "pending" && (
          <Button
            size="sm"
            variant={open ? "secondary" : "default"}
            onClick={() => setOpen(!open)}
          >
            {open ? "Cancel" : "Submit"}
          </Button>
        )}
      </div>

      {open && task.status === "pending" && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <Textarea
            placeholder="Notes about your submission (optional)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-4 transition-smooth hover:border-primary hover:bg-accent/30">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-sm">
              {file ? (
                <span className="font-medium">{file.name}</span>
              ) : (
                <>
                  <span className="font-medium">Click to upload</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — uploaded to Cloudinary
                  </span>
                </>
              )}
            </div>
            <Input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex justify-end">
            <Button onClick={submit}>Submit task</Button>
          </div>
        </div>
      )}
    </div>
  );
}
