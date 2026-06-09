import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Committee Recruitment</h1>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              setRole("MEMBER");
              fetchStatus("MEMBER");
            }}
            className={
              role === "MEMBER" ? "bg-secondary hover:bg-secondary/80 " : ""
            }
          >
            Member
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setRole("DIRECTOR");
              fetchStatus("DIRECTOR");
            }}
            className={
              role === "DIRECTOR" ? "bg-secondary hover:bg-secondary/80" : ""
            }
          >
            Director
          </Button>
          <Button
            size="sm"
            onClick={() => setFormOpen(true)}
            className="bg-success hover:bg-success/80 text-white"
          >
            Open Recruitment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-6">
          <Spinner />
        </div>
      ) : (
        <div>
          <div className="  p-4">
            <h3 className="text-xl font-medium mb-2">
              {status?.committeeName || "Committee"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Status: {status?.status || "-"} 
            </p>
            <Table
              columns={getColumns()}
              data={(status && status.processes) || []}
              loading={loading}
              rowsPerPage={10}
            />
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
