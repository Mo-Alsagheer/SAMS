import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { getInitials } from "@/utils/getInitials";
import { useExecutiveApplications } from "@/executive/hooks/useExecutiveApplications";

/* ---------------- Schema ---------------- */

const scheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  link: z.url("Enter valid meeting link"),
});

const scheduleFields = [
  {
    name: "date",
    label: "Interview Date",
    type: "datetime-local",
  },
  {
    name: "link",
    label: "Meeting Link",
  },
];

/* ---------------- Skeleton ---------------- */

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

/* ---------------- Page ---------------- */

function Applications() {
  const navigate = useNavigate();

  const {
    committees,
    selectedCommittee,
    applications,
    loading,
    actionLoadingId,

    scheduleOpen,
    openSchedule,
    closeSchedule,
    scheduleInterview,

    selectCommittee,
    acceptPhase1,
    rejectPhase1,
    acceptPhase2,
    rejectPhase2,
  } = useExecutiveApplications();

  /* ---------------- Badges ---------------- */

  const getStatusBadge = (status) => {
    const map = {
      SUBMITTED: "bg-gray-100 text-gray-700",
      AI_REVIEWED: "bg-purple-100 text-purple-700",
      PHASE1_ACCEPTED: "bg-green-100 text-green-700",
      INTERVIEW_SCHEDULED: "bg-blue-100 text-blue-700",
      PHASE2_ACCEPTED: "bg-emerald-100 text-emerald-700",
      PHASE1_REJECTED: "bg-red-100 text-red-700",
      PHASE2_REJECTED: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${map[status] || "bg-muted"}`}
      >
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const map = {
      DIRECTOR: "bg-primary/10 text-primary",
      MEMBER: "bg-secondary/10 text-secondary",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${map[role] || "bg-muted"}`}
      >
        {role}
      </span>
    );
  };

  /* ---------------- Actions Renderer ---------------- */

  const renderActions = (row) => {
    const isLoading = actionLoadingId === row.id;

    switch (row.status) {
      case "SUBMITTED":
      case "AI_REVIEWED":
        return (
          <>
            <button
              onClick={() => acceptPhase1(row.id)}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-md bg-green-600 text-white"
            >
              Accept
            </button>

            <button
              onClick={() => rejectPhase1(row.id)}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-md bg-red-600 text-white"
            >
              Reject
            </button>
          </>
        );

      case "PHASE1_ACCEPTED":
        return (
          <button
            onClick={() => openSchedule(row.id)}
            disabled={isLoading}
            className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white"
          >
            Schedule Interview
          </button>
        );

      case "INTERVIEW_SCHEDULED":
        return (
          <>
            <button
              onClick={() => acceptPhase2(row.id)}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-md bg-green-600 text-white"
            >
              Final Accept
            </button>

            <button
              onClick={() => rejectPhase2(row.id)}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-md bg-red-600 text-white"
            >
              Final Reject
            </button>
          </>
        );

      case "PHASE2_ACCEPTED":
        return <span className="text-green-600 text-xs">Completed</span>;

      case "PHASE1_REJECTED":
      case "PHASE2_REJECTED":
        return <span className="text-red-600 text-xs">Rejected</span>;

      default:
        return null;
    }
  };

  /* ---------------- Columns ---------------- */

  const columns = useMemo(
    () => [
      {
        header: "Applicant",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {getInitials(row?.name || "")}
            </div>
            <div>
              <p className="font-medium">{row?.name}</p>
              <p className="text-xs text-muted-foreground">{row?.email}</p>
            </div>
          </div>
        ),
      },
      { header: "Phone", accessor: "phone" },
      {
        header: "Target Role",
        render: (row) => getRoleBadge(row?.targetRole),
      },
      {
        header: "Status",
        render: (row) => getStatusBadge(row?.status),
      },
      {
        header: "Links",
        render: (row) => (
          <div className="flex gap-3 text-sm">
            <a
              href={row?.linkedinLink}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
            <a
              href={row?.cvLink}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              CV
            </a>
          </div>
        ),
      },
      {
        header: "Actions",
        render: (row) => <div className="flex gap-2">{renderActions(row)}</div>,
      },
    ],
    [
      actionLoadingId,
      acceptPhase1,
      rejectPhase1,
      acceptPhase2,
      rejectPhase2,
      openSchedule,
    ],
  );

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-9 w-24" />
        <div className="border rounded-xl p-4 space-y-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-secondary">
          Executive Applications
        </h1>
      </div>

      <select
        value={selectedCommittee}
        onChange={(e) => selectCommittee(e.target.value)}
        className="border rounded-lg px-3 py-2 bg-card text-sm"
      >
        <option value="">Select Committee</option>
        {committees.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="border rounded-xl bg-card">
        <Table columns={columns} data={applications} />
      </div>

      <PopupForm
        open={scheduleOpen}
        onClose={closeSchedule}
        title="Schedule Interview"
        schema={scheduleSchema}
        defaultValues={{ date: "", link: "" }}
        fields={scheduleFields}
        onSubmit={scheduleInterview}
        submitLabel="Schedule"
      />
    </div>
  );
}

export default Applications;
