import React, { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import api from "@/features/api";
import { getCommittees } from "@/features/committee/committee";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { PopupForm } from "@/components/shared/PopupForm";
import StatCard from "@/components/shared/StatCard";

import { Building2, Users, CheckCircle, XCircle } from "lucide-react";

const recruitmentSchema = z.object({
  role: z.enum(["MEMBER", "DIRECTOR", "EXECUTIVE"]),
  targetMembers: z.number().min(1),
});

const ROLES = ["MEMBER", "DIRECTOR", "EXECUTIVE"];

function Recruitment() {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [activeCommittee, setActiveCommittee] = useState(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const [committees, recruitmentsRes] = await Promise.all([
        getCommittees(),
        api.get("/executive/recruitment"),
      ]);

      const recruitments = recruitmentsRes.data;

      const grouped = committees.map((committee) => {
        const committeeRecruitments = recruitments.filter(
          (r) => r.committeeId === committee.id,
        );

        const normalizedRecruitments = ROLES.map((role) => {
          const existing = committeeRecruitments.find((r) => r.role === role);

          if (existing) return existing;

          return {
            id: null,
            committeeId: committee.id,
            committeeName: committee.name,
            role,
            targetMembers: "-",
            status: "NOT_EXIST",
          };
        });

        return {
          committeeId: committee.id,
          committeeName: committee.name,
          recruitments: normalizedRecruitments,
        };
      });

      setGroupedData(grouped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= OPEN FORM =================
  const openRecruitmentForm = (row, role, existing = null) => {
    setActiveCommittee({
      committeeId: row.committeeId,
      committeeName: row.committeeName,
      selectedRole: role,
      existing,
    });

    setFormOpen(true);
  };

  // ================= SUBMIT OPEN =================
  const handleSubmitRecruitment = async (data) => {
    try {
      await api.post(
        `/executive/recruitment/${activeCommittee.committeeId}/open`,
        {
          role: activeCommittee.selectedRole,
          targetMembers: data.targetMembers,
        },
      );

      toast.success("Recruitment opened successfully");

      setFormOpen(false);
      setActiveCommittee(null);

      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to open recruitment");
    }
  };

  // ================= CLOSE ONLY =================
  const closeRecruitment = async (row) => {
    try {
      await api.post(`/executive/recruitment/${row.id}/close`);

      toast.success("Closed successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Error closing recruitment");
    }
  };

  // ================= REOPEN FLOW =================
  const reopenRecruitment = (row, committee) => {
    openRecruitmentForm(committee, row.role, row);
  };

  // ================= STATS =================
  const totalCommittees = groupedData.length;

  const totalRecruitments = groupedData.reduce(
    (acc, c) =>
      acc + c.recruitments.filter((r) => r.status !== "NOT_EXIST").length,
    0,
  );

  const openRecruitments = groupedData.reduce(
    (acc, c) => acc + c.recruitments.filter((r) => r.status === "OPEN").length,
    0,
  );

  const emptySlots = groupedData.reduce(
    (acc, c) =>
      acc + c.recruitments.filter((r) => r.status === "NOT_EXIST").length,
    0,
  );

  // ================= TABLE =================
  const columns = [
    { header: "Role", accessor: "role" },
    { header: "Target", accessor: "targetMembers" },

    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            row.status === "OPEN"
              ? "bg-green-100 text-green-600"
              : row.status === "CLOSED"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.status}
        </span>
      ),
    },

    {
      header: "Actions",
      render: (row, committee) => (
        <div className="flex gap-2">
          {/* NOT EXIST → OPEN */}
          {row.status === "NOT_EXIST" && (
            <Button
              size="sm"
              className="bg-blue-500 text-white"
              onClick={() => openRecruitmentForm(row, row.role)}
            >
              Open
            </Button>
          )}

          {/* OPEN → CLOSE ONLY */}
          {row.status === "OPEN" && row.id && (
            <Button
              size="sm"
              className="bg-red-500 text-white"
              onClick={() => closeRecruitment(row)}
            >
              Close
            </Button>
          )}

          {/* CLOSED → REOPEN */}
          {row.status === "CLOSED" && (
            <Button
              size="sm"
              className="bg-gray-500 text-white"
              onClick={() => openRecruitmentForm(row, row.role)}
            >
              Reopen
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* ================= DASHBOARD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Committees"
          value={totalCommittees}
          icon={Building2}
          color="primary"
        />

        <StatCard
          title="Recruitments"
          value={totalRecruitments}
          icon={Users}
          color="secondary"
        />

        <StatCard
          title="Open"
          value={openRecruitments}
          icon={CheckCircle}
          color="success"
        />

        <StatCard
          title="Empty Slots"
          value={emptySlots}
          icon={XCircle}
          color="warning"
        />
      </div>

      <h1 className="text-xl font-semibold">Recruitment Management</h1>

      {/* ================= TABLE ================= */}
      <div className="space-y-4">
        {groupedData.map((committee) => (
          <div
            key={committee.committeeId}
            className="border rounded-lg p-4 bg-white"
          >
            <h2 className="text-lg font-semibold mb-3">
              {committee.committeeName}
            </h2>

            <Table
              columns={columns}
              data={committee.recruitments}
              extraProps={committee}
            />
          </div>
        ))}
      </div>

      {/* ================= POPUP ================= */}
      {activeCommittee && (
        <PopupForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setActiveCommittee(null);
          }}
          title={`Recruitment - ${activeCommittee.committeeName}`}
          schema={recruitmentSchema}
          defaultValues={{
            role: activeCommittee.selectedRole,
            targetMembers: activeCommittee.existing?.targetMembers || 1,
          }}
          fields={[
            {
              name: "role",
              label: "Role",
              type: "readonly",
              
            },
            {
              name: "targetMembers",
              label: "Target Members",
              type: "number",
            },
          ]}
          onSubmit={handleSubmitRecruitment}
        />
      )}
    </div>
  );
}

export default Recruitment;
