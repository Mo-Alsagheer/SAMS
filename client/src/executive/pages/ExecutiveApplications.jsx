import React, { useMemo } from "react";
import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { Button } from "@/components/ui/button";
import { z } from "zod";

import { useExecutiveApplications } from "@/executive/hooks/useExecutiveApplications";

const scheduleSchema = z.object({
  date: z.string().min(1),
  link: z.string().url(),
});

const scheduleFields = [
  { name: "date", label: "Interview Date", type: "datetime-local" },
  { name: "link", label: "Meeting Link" },
];

function ExecutiveApplications() {
  const hook = useExecutiveApplications();

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
      { header: "Name", accessor: "name" },
      { header: "Email", accessor: "email" },
      { header: "Status", accessor: "status" },
      { header: "Actions", render: renderActions },
    ],
    [hook.actionLoadingId],
  );

  return (
    <>
      <Table
        columns={columns}
        data={hook.applications}
        loading={hook.loading}
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

export default ExecutiveApplications;
