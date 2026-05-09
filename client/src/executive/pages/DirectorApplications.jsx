import React, { useMemo } from "react";
import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { getInitials } from "@/utils/getInitials";
import { Button } from "@/components/ui/button";
import { z } from "zod";

import { useDirectorApplications } from "@/executive/hooks/useDirectorApplications";
import SearchBar from "@/components/shared/SearchBar";

/* schema */
const scheduleSchema = z.object({
  date: z.string().min(1),
  link: z.string().url(),
});

const scheduleFields = [
  { name: "date", label: "Interview Date", type: "datetime-local" },
  { name: "link", label: "Meeting Link" },
];

function DirectorApplications() {
  const hook = useDirectorApplications();

  const renderActions = (row) => {
    const isLoading = hook.actionLoadingId === row.id;

    const btn = (label, onClick, color) => (
      <Button
        size="sm"
        disabled={isLoading}
        onClick={onClick}
        className={color}
      >
        {label}
      </Button>
    );

    switch (row.status) {
      case "SUBMITTED":
      case "AI_REVIEWED":
        return (
          <>
            {btn("Accept", () => hook.acceptPhase1(row.id), "bg-green-600")}
            {btn("Reject", () => hook.rejectPhase1(row.id), "bg-red-600")}
          </>
        );

      case "PHASE1_ACCEPTED":
        return btn("Schedule", () => hook.openSchedule(row.id), "bg-blue-600");

      case "INTERVIEW_SCHEDULED":
        return (
          <>
            {btn("Accept", () => hook.acceptPhase2(row.id), "bg-green-600")}
            {btn("Reject", () => hook.rejectPhase2(row.id), "bg-red-600")}
          </>
        );

      default:
        return null;
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Applicant",
        render: (r) => (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              {getInitials(r.name)}
            </div>
            <div>
              <p>{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.email}</p>
            </div>
          </div>
        ),
      },
      { header: "Phone", accessor: "phone" },
      { header: "Status", accessor: "status" },
      {
        header: "Actions",
        render: renderActions,
      },
    ],
    [hook.actionLoadingId],
  );

  return (
    <>
      {/* Committee */}
      <div className="flex flex-col md:flex-row">
        <SearchBar />
        <select
          value={hook.selectedCommittee}
          onChange={(e) => hook.selectCommittee(e.target.value)}
          className="border bg-white rounded-lg px-3 py-2 mb-4"
        >
          <option value="">Select Committee</option>
          {hook.committees.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={hook.applications}
        loading={hook.loadingApplications}
      />

      <PopupForm
        open={hook.scheduleModalOpen}
        onClose={hook.closeSchedule}
        title="Schedule Interview"
        schema={scheduleSchema}
        fields={scheduleFields}
        onSubmit={hook.scheduleInterview}
      />
    </>
  );
}

export default DirectorApplications;
