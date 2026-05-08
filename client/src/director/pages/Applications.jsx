import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import SearchBar from "../../components/shared/SearchBar";
import FilterDropdown from "../../components/shared/FilterDropdown";
import Table from "../../components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";

import { manageMembersApllications } from "../../features/applications/applications";
import { getInitials } from "../../utils/getInitials";
import { getCurrentUser } from "@/features/auth/session";
import { Button } from "@/components/ui/button";

const scheduleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  link: z.string().url("Enter valid meeting link"),
});

const scheduleFields = [
  { name: "date", label: "Interview Date", type: "datetime-local" },
  { name: "link", label: "Meeting Link" },
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

  const user = getCurrentUser()();
  const committeeId = user?.committeeId || "";

  const loadApplications = useCallback(async () => {
    if (!committeeId) return;

    setLoading(true);
    try {
      const data = await manageMembersApllications.list({
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
          await manageMembersApllications.acceptPhase2(row.id);
          toast.success("Final accepted");
        } else {
          await manageMembersApllications.acceptPhase1(row.id);
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
          await manageMembersApllications.rejectPhase2(row.id);
          toast.success("Final rejected");
        } else {
          await manageMembersApllications.rejectPhase1(row.id);
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

  const scheduleInterview = async (values) => {
    try {
      await manageMembersApllications.scheduleInterview(selectedAppId, values);
      toast.success("Interview scheduled");
      closeSchedule();
      loadApplications();
    } catch {
      toast.error("Failed to schedule interview");
    }
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return (applications || []).filter((item) => {
      const matchesStatus = status === "All" || item.status === status;
      const matchesSearch =
        !q || `${item.name} ${item.email}`.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [applications, search, status]);

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
        render: (row) => <span>{row.status}</span>,
      },
      {
        header: "Actions",
        render: (row) => {
          const isLoading = actionLoadingId === row.id;

          return (
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/applications/${row.id}`)}
                className="bg-blue-600"
              >
                View
              </Button>

              <Button
                disabled={isLoading}
                onClick={() => accept(row)}
                className="bg-green-600"
              >
                Accept
              </Button>

              <Button
                disabled={isLoading}
                onClick={() => reject(row)}
                className="bg-red-600"
              >
                Reject
              </Button>

              {row.status === "PHASE1_ACCEPTED" && (
                <Button
                  onClick={() => openSchedule(row.id)}
                  className="bg-blue-500"
                >
                  Schedule
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [accept, reject, actionLoadingId, navigate],
  );

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <FilterDropdown
          options={[
            "All",
            "SUBMITTED",
            "AI_REVIEWED",
            "INTERVIEW_SCHEDULED",
            "PHASE1_ACCEPTED",
            "PHASE1_REJECTED",
            "PHASE2_ACCEPTED",
            "PHASE2_REJECTED",
          ]}
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
