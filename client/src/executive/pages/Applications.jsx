import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { getInitials } from "@/utils/getInitials";
import { useApplications } from "@/hooks/applications/useApplications";
import { manageDirectorsApllications } from "@/features/applications/applications";

/* ---------------- Schema ---------------- */

const scheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  link: z.string().url("Enter valid meeting link"),
});

const scheduleFields = [
  { name: "date", label: "Interview Date", type: "datetime-local" },
  { name: "link", label: "Meeting Link" },
];

/* ---------------- Skeleton ---------------- */

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

/* ---------------- Page ---------------- */

function Applications() {
  
  const navigate = useNavigate();

  const {
    committees,
    applications,
    selectedCommittee,
    selectCommittee,
    loadingCommittees,
    loadingApplications,
    actionLoadingId,

    scheduleModalOpen,
    openSchedule,
    closeSchedule,
    scheduleInterview,

    acceptPhase1,
    rejectPhase1,
    acceptPhase2,
    rejectPhase2,
  } = useApplications("executive", manageDirectorsApllications); 


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
      <span className={`px-2 py-1 text-xs rounded-full ${map[status] || ""}`}>
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
      <span className={`px-2 py-1 text-xs rounded-full ${map[role] || ""}`}>
        {role}
      </span>
    );
  };

  /* ---------------- Actions ---------------- */

  const renderActions = (row) => {
    const isLoading = actionLoadingId === row.id;

    const btn = (label, onClick, color) => (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-3 py-1 text-xs rounded-md text-white ${color}`}
      >
        {label}
      </button>
    );

    switch (row.status) {
      case "SUBMITTED":
      case "AI_REVIEWED":
        return (
          <>
            {btn("Accept", () => acceptPhase1(row.id), "bg-green-600")}
            {btn("Reject", () => rejectPhase1(row.id), "bg-red-600")}
          </>
        );

      case "PHASE1_ACCEPTED":
        return btn("Schedule", () => openSchedule(row.id), "bg-blue-600");

      case "INTERVIEW_SCHEDULED":
        return (
          <>
            {btn("Final Accept", () => acceptPhase2(row.id), "bg-green-600")}
            {btn("Final Reject", () => rejectPhase2(row.id), "bg-red-600")}
          </>
        );

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
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
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
      { header: "Role", render: (r) => getRoleBadge(r.targetRole) },
      { header: "Status", render: (r) => getStatusBadge(r.status) },
      {
        header: "Links",
        render: (r) => (
          <div className="flex gap-3 text-sm">
            <a href={r.linkedinLink} target="_blank">
              LinkedIn
            </a>
            <a href={r.cvLink} target="_blank">
              CV
            </a>
          </div>
        ),
      },
      {
        header: "Actions",
        render: (r) => <div className="flex gap-2">{renderActions(r)}</div>,
      },
    ],
    [actionLoadingId],
  );

  /* ---------------- UI ---------------- */

  if (loadingCommittees) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer bg-white border p-2 rounded-full"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-2xl font-semibold">Director Applications</h1>
      </div>

      {/* Committee */}
      <select
        value={selectedCommittee}
        onChange={(e) => selectCommittee(e.target.value)}
        className="border bg-white rounded-lg px-3 py-2"
      >
        <option value="">Select Committee</option>
        {committees.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Table */}
      <Table
        columns={columns}
        data={applications}
        loading={loadingApplications}
      />

      {/* Modal */}
      <PopupForm
        open={scheduleModalOpen}
        onClose={closeSchedule}
        title="Schedule Interview"
        schema={scheduleSchema}
        fields={scheduleFields}
        onSubmit={scheduleInterview}
        submitLabel="Schedule"
      />
    </div>
  );
}

export default Applications;
