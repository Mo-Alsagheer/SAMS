import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Table from "@/components/shared/Table";
import { toast } from "sonner";
import { getCommitteeRecruitmentStatus } from "@/features/recruitment/recruitment";
import { closeRecruitmentApi } from "@/features/recruitment/recruitment";
import { PopupForm } from "@/components/shared/PopupForm";
import { z } from "zod";
import { openCommitteeRecruitment } from "@/features/recruitment/recruitment";

function CommitteeRecruitment() {
  const { committeeId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState("MEMBER");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchStatus = async (r) => {
    try {
      setLoading(true);
      const res = await getCommitteeRecruitmentStatus(committeeId, r);
      setStatus(res);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!committeeId) return;
    fetchStatus(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committeeId]);

  useEffect(() => {
    if (!committeeId) return;
    fetchStatus(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const getColumns = () => [
    { header: "ID", accessor: "id" },
    { header: "Role", accessor: "role" },
    {
      header: "Target",
      accessor: "targetMembers",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${row.status === "OPEN" ? "bg-green-100 text-green-600" : row.status === "CLOSED" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Opened At",
      accessor: "openedAt",
      sortable:true,
      render: (row) =>
        row.openedAt ? new Date(row.openedAt).toLocaleString() : "-",
    },
    {
      header: "Closed At",
      accessor: "closedAt",
      render: (row) =>
        row.closedAt ? new Date(row.closedAt).toLocaleString() : "-",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "OPEN" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                try {
                  setActionLoadingId(row.id);
                  await closeRecruitmentApi(row.id);
                  toast.success("Recruitment closed");
                  fetchStatus(role);
                } catch (err) {
                  toast.error(
                    err?.response?.data?.message ||
                      "Failed to close recruitment",
                  );
                } finally {
                  setActionLoadingId(null);
                }
              }}
              disabled={actionLoadingId === row.id}
            >
              {actionLoadingId === row.id ? "Closing..." : "Close"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  const recruitmentSchema = z.object({
    role: z.enum(["MEMBER", "DIRECTOR"]),
    targetMembers: z.number().min(1),
  });

  const handleOpenRecruitment = async (data) => {
    try {
      setLoading(true);
      await openCommitteeRecruitment(committeeId, data);
      toast.success("Recruitment opened successfully");
      setFormOpen(false);
      fetchStatus(role);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to open recruitment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2 rounded-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <div className="text-lg sm:text-xl font-semibold leading-tight">
              {status?.committeeName || "Committee"}
            </div>
            <div className="text-sm text-muted-foreground">
              Status:{" "}
              <span className="font-medium">{status?.status || "-"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            className="bg-success hover:bg-success/90 text-white px-3 py-2 rounded-md"
          >
            Open Recruitment
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="inline-flex rounded-md bg-muted p-1">
          <button
            onClick={() => {
              setRole("MEMBER");
              fetchStatus("MEMBER");
            }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${role === "MEMBER" ? "bg-primary text-white" : "text-foreground"}`}
          >
            Members
          </button>
          <button
            onClick={() => {
              setRole("DIRECTOR");
              fetchStatus("DIRECTOR");
            }}
            className={`px-3 py-2 rounded-md text-sm font-medium ${role === "DIRECTOR" ? "bg-primary text-white" : "text-foreground"}`}
          >
            Directors
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner className="w-10 h-10" />
        </div>
      ) : (
        <div className="bg-card shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <Table
                columns={getColumns()}
                data={(status && status.processes) || []}
                loading={loading}
                rowsPerPage={10}
              />
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <PopupForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={`Open Recruitment - ${status?.committeeName || committeeId}`}
          schema={recruitmentSchema}
          defaultValues={{ role, targetMembers: 1 }}
          fields={[
            { name: "role", label: "Role", type: "readonly" },
            { name: "targetMembers", label: "Target Members", type: "number" },
          ]}
          onSubmit={handleOpenRecruitment}
        />
      )}
    </div>
  );
}

export default CommitteeRecruitment;
