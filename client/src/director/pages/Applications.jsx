import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import SearchBar from "../../components/shared/SearchBar";
import FilterDropdown from "../../components/shared/FilterDropdown";
import Table from "../../components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";

import {
  listMemberApplications,
  acceptMemberPhase1,
  rejectMemberPhase1,
  acceptMemberPhase2,
  rejectMemberPhase2,
  scheduleMemberInterview,
} from "@/features/applications/memberApplications";

import { getInitials } from "../../utils/getInitials";
import { getCurrentUser } from "@/features/auth/session";
import { Button } from "@/components/ui/button";
import { ACTION_STYLES, APPLICATION_STATUS } from "@/constant/applicationStatus";

const scheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  link: z.string().url("Enter valid meeting link"),
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

function Applications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState(null);

  const navigate = useNavigate();

  const user = getCurrentUser();
  const committeeId = user?.committeeId || "";

  const loadApplications = useCallback(async () => {
    if (!committeeId) return;

    setLoading(true);

    try {
      const data = await listMemberApplications({
        committeeId,
        status: status === "All" ? "" : status,
      });

      setApplications(data || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [committeeId, status]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const accept = useCallback(
    async (row) => {
      setActionLoadingId(row.id);

      try {
        if (row.status === "INTERVIEW_SCHEDULED") {
          await acceptMemberPhase2(row.id);

          toast.success("Final accepted");
        } else {
          await acceptMemberPhase1(row.id);

          toast.success("Accepted");
        }

        await loadApplications();
      } catch {
        toast.error("Failed to accept");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications],
  );

  const reject = useCallback(
    async (row) => {
      setActionLoadingId(row.id);

      try {
        if (row.status === "INTERVIEW_SCHEDULED") {
          await rejectMemberPhase2(row.id);

          toast.success("Final rejected");
        } else {
          await rejectMemberPhase1(row.id);

          toast.success("Rejected");
        }

        await loadApplications();
      } catch {
        toast.error("Failed to reject");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications],
  );

  const openSchedule = (id) => {
    setSelectedAppId(id);
    setScheduleModalOpen(true);
  };

  const closeSchedule = () => {
    setSelectedAppId(null);
    setScheduleModalOpen(false);
  };

  const scheduleInterview = useCallback(
    async (formData) => {
      if (!selectedAppId) return;

      setActionLoadingId(selectedAppId);

      try {
        await scheduleMemberInterview(selectedAppId, {
          date: new Date(formData.date).toISOString(),

          link: formData.link,
        });

        toast.success("Interview scheduled");

        await loadApplications();

        closeSchedule();
      } catch {
        toast.error("Failed to schedule interview");
      } finally {
        setActionLoadingId(null);
      }
    },
    [selectedAppId, loadApplications],
  );

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return (applications || []).filter((item) => {
      const matchesStatus = status === "All" || item.status === status;

      const matchesSearch =
        !q || `${item.name} ${item.email}`.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, search, status]);

  const renderActions = (row) => {
    const isLoading = actionLoadingId === row.id;

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
            {btn("Accept", () => accept(row), ACTION_STYLES.ACCEPT)}

            {btn("Reject", () => reject(row), ACTION_STYLES.REJECT)}
          </div>
        );

      case "PHASE1_ACCEPTED":
        return (
          <div className="flex gap-2">
            {btn("Schedule", () => openSchedule(row.id), ACTION_STYLES.PRIMARY)}
          </div>
        );

      case "INTERVIEW_SCHEDULED":
        return (
          <div className="flex gap-2">
            {btn("Accept", () => accept(row), ACTION_STYLES.ACCEPT)}

            {btn("Reject", () => reject(row), ACTION_STYLES.REJECT)}
          </div>
        );

      default:
        return null;
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Applicant",

        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-primary flex items-center justify-center">
              {getInitials(row.name || "")}
            </div>

            <div>
              <p>{row.name}</p>

              <p className="text-sm text-gray-500">{row.email}</p>
            </div>
          </div>
        ),
      },

      {
        header: "Status",

        render: (row) => (
          <span>
            {APPLICATION_STATUS.find((status) => status.value === row.status)
              ?.name || row.status}
          </span>
        ),
      },
      {
        header: "Cv Score",
        // accessor: "aiScore.overall",
        render: (row) => <span>{row.aiScore?.overall ?? "-"}</span>,
      },
      {
        header: "View",

        render: (row) => (
          <Button
            size="sm"
            className="bg-indigo-600"
            onClick={() => navigate(`/director/applications/${row.id}`)}
          >
            View
          </Button>
        ),
      },

      {
        header: "Actions",

        render: (row) => renderActions(row),
      },
    ],
    [actionLoadingId, accept, reject, navigate],
  );

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />

        <FilterDropdown
          options={APPLICATION_STATUS}
          value={status}
          onChange={setStatus}
        />
      </div>

      <Table columns={columns} data={filteredData} loading={loading} />

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
