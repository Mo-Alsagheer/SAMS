import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import SearchBar from "../../components/shared/SearchBar";
import FilterDropdown from "../../components/shared/FilterDropdown";
import Table from "../../components/shared/Table";
import { manageMembersApllications } from "../../features/applications/applications";
import { getInitials } from "../../utils/getInitials";

import { getAuthUser } from "@/features/auth/session";

function Applications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const user = getAuthUser();
  const committeeId = user?.committeeId || "";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      setCommitteeId(window.sessionStorage.getItem("committeeId") || "");
    } catch {
      // ignore
    }
  }, []);

  const loadApplications = useCallback(async () => {
    if (!committeeId) {
      setApplications([]);
      return;
    }

    setLoading(true);
    try {
      const data = await manageMembersApllications.list({
        committeeId,
        status: status === "All" ? "" : status,
      });
      setApplications(data || []);
    } catch {
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [committeeId, status]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const getStatusBadgeClass = (apiStatus) => {
    switch (apiStatus) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-700";
      case "AI_REVIEWED":
        return "bg-purple-100 text-purple-700";
      case "PHASE1_ACCEPTED":
      case "PHASE2_ACCEPTED":
        return "bg-green-100 text-green-700";
      case "PHASE1_REJECTED":
      case "PHASE2_REJECTED":
        return "bg-red-100 text-red-700";
      case "INTERVIEW_SCHEDULED":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
        toast.error("Failed to accept application");
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
        toast.error("Failed to reject application");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications],
  );

  const statusOptions = [
    "All",
    "SUBMITTED",
    "AI_REVIEWED",
    "PHASE1_ACCEPTED",
    "INTERVIEW_SCHEDULED",
    "PHASE2_ACCEPTED",
    "PHASE1_REJECTED",
    "PHASE2_REJECTED",
  ];

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (applications || []).filter((item) => {
      const matchesStatus = status === "All" || item.status === status;
      if (!matchesStatus) return false;

      if (!q) return true;

      const haystack = `${item?.name || ""} ${item?.email || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, search, status]);

  const applicationsFields = useMemo(
    () => [
      {
        header: "Applicant",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-700">
              {getInitials(row?.name || "")}
            </div>

            <div>
              <p className="font-medium">{row?.name}</p>
              <p className="text-sm text-gray-500">{row?.email}</p>
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        render: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(
              row.status,
            )}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        header: "Applied",
        render: (row) => {
          const raw = row?.createdAt || row?.appliedAt || row?.applied;
          if (!raw) return "-";

          const date = new Date(raw);
          if (Number.isNaN(date.getTime())) return String(raw);

          return date.toLocaleDateString();
        },
      },
      {
        header: "Actions",
        render: (row) => {
          const isLoading = actionLoadingId === row.id;
          const canDecide =
            row.status === "SUBMITTED" ||
            row.status === "AI_REVIEWED" ||
            row.status === "INTERVIEW_SCHEDULED";

          return (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/director/applications/${row.id}`)}
                className="text-blue-600 hover:underline"
              >
                View
              </button>

              <button
                onClick={() => accept(row)}
                disabled={!canDecide || isLoading}
                className={`hover:underline ${
                  !canDecide || isLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-green-600"
                }`}
              >
                Accept
              </button>

              <button
                onClick={() => reject(row)}
                disabled={!canDecide || isLoading}
                className={`hover:underline ${
                  !canDecide || isLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600"
                }`}
              >
                Reject
              </button>
            </div>
          );
        },
      },
    ],
    [accept, actionLoadingId, navigate, reject],
  );

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} className="bg-white" />

        <FilterDropdown
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />
      </div>
      {!committeeId ? (
        <div className="text-gray-500">No committeeId found in session.</div>
      ) : (
        <Table
          columns={applicationsFields}
          data={filteredData}
          loading={loading}
        />
      )}
    </div>
  );
}

export default Applications;
