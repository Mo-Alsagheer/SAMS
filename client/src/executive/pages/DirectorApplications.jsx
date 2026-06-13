import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
          <div className="flex gap-2">
            {btn("Accept", () => hook.acceptPhase1(row.id), "bg-green-600")}
            {btn("Reject", () => hook.rejectPhase1(row.id), "bg-red-600")}
            {btn(
              "Details",
              () => navigate(`/executive/applications/${row.id}`),
              "bg-slate-600 hover:bg-slate-500 dark:bg-primary",
            )}
          </div>
        );

      case "PHASE1_ACCEPTED":
        return (
          <div className="flex gap-2">
            {btn(
              "Schedule",
              () => hook.openSchedule(row.id),
              "bg-blue-600 hover:bg-blue-500",
            )}
            {btn(
              "Details",
              () => navigate(`/executive/applications/${row.id}`),
              "bg-slate-600 hover:bg-slate-500 dark:bg-primary",
            )}
          </div>
        );

      case "INTERVIEW_SCHEDULED":
        return (
          <div className="flex gap-2">
            {btn("Accept", () => hook.acceptPhase2(row.id), "bg-green-600")}
            {btn("Reject", () => hook.rejectPhase2(row.id), "bg-red-600")}
            {btn(
              "Details",
              () => navigate(`/executive/applications/${row.id}`),
              "bg-slate-600 hover:bg-slate-500 dark:bg-primary",
            )}
          </div>
        );

      default:
        return (
          <>
            {btn(
              "Details",
              () => navigate(`/executive/applications/${row.id}`),
              "bg-slate-600 hover:bg-slate-500 dark:bg-primary",
            )}
          </>
        );
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
      {
        header: "Phone",
        render: (r) => (
          <div>
            <p className="text-xs text-muted-foreground">{r.phone}</p>
          </div>
        ),
      },
      {
        header: "Status",
        render: (r) => (
          <div>
            <p className="text-xs text-muted-foreground">{r.status}</p>
          </div>
        ),
      },
      {
        header: "CV Score",
        render: (r) => (
          <div>
            <p className="text-xs text-muted-foreground">
              {r.aiScore?.final_score ?? (r.aiScore?.error ? "Error" : "-")}
            </p>
          </div>
        ),
      },
      {
        header: "Actions",
        render: renderActions,
      },
    ],
    [hook.actionLoadingId, navigate],
  );

  const filteredData = useMemo(() => {
    const q = (search || "").toLowerCase();

    return (hook.applications || []).filter((item) =>
      `${item.name} ${item.email} ${item.phone}`.toLowerCase().includes(q),
    );
  }, [hook.applications, search]);

  return (
    <>
      {/* Committee */}
      <div className="flex flex-col gap-3 md:flex-row">
        <SearchBar value={search} onChange={setSearch} />
        <select
          value={hook.selectedCommittee}
          onChange={(e) => hook.selectCommittee(e.target.value)}
          className="border bg-white rounded-lg px-3 py-2 mb-4 dark:bg-card"
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
        data={filteredData}
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
