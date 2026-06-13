import React, { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import {
  getRecruitments,
  openExecutiveRecruitment,
  openCommitteeRecruitment,
  closeRecruitmentApi,
} from "@/features/recruitment/recruitment";
import { getCommittees } from "@/features/committee/committee";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { PopupForm } from "@/components/shared/PopupForm";
import StatCard from "@/components/shared/StatCard";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { Building2, Users, CheckCircle, XCircle } from "lucide-react";

const recruitmentSchema = z.object({
  role: z.enum(["MEMBER", "DIRECTOR", "EXECUTIVE"]),
  title: z.string().optional(),
  targetMembers: z.number().min(1),
});

function Recruitment() {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("EXECUTIVE");
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [activeCommittee, setActiveCommittee] = useState(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const [committees, recruitments] = await Promise.all([
        getCommittees(),
        getRecruitments(),
      ]);

      // ===== GLOBAL EXECUTIVE =====
      const executiveRoles = [
        "Web Master & Technical Director",
        "Treasurer",
        "Secretary",
        "Chairman",
      ];

      const executiveRecruitments = recruitments.filter(
        (r) => r.role === "EXECUTIVE" && !r.committeeId,
      );

      const normalizedExecutiveRecruitments = executiveRoles.map((title) => {
        const existing = executiveRecruitments.find((r) => r.title === title);

        if (existing) return existing;

        return {
          id: null,
          committeeId: null,
          committeeName: "Executive",
          role: "EXECUTIVE",
          title,
          targetMembers: "-",
          status: "NOT_EXIST",
        };
      });

      const executiveSection = {
        committeeId: "EXECUTIVE",
        committeeName: "Executive",
        recruitments: normalizedExecutiveRecruitments,
      };

      // ===== COMMITTEES =====
      const grouped = committees.map((committee) => {
        const committeeRecruitments = recruitments.filter(
          (r) => r.committeeId === committee.id && r.role !== "EXECUTIVE",
        );

        const normalizedRecruitments = ["MEMBER", "DIRECTOR"].map((role) => {
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

      setGroupedData([executiveSection, ...grouped]);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load recruitments",
      );
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
      committeeId: row.committeeId || null,
      committeeName: row.committeeName,
      selectedRole: role,
      selectedTitle: row.title || null,
      existing,
    });

    setFormOpen(true);
  };

  // ================= SUBMIT OPEN =================
  const handleSubmitRecruitment = async (data) => {
    try {
      let res;

      if (activeCommittee.selectedRole === "EXECUTIVE") {
        res = await openExecutiveRecruitment({
          role: "EXECUTIVE",
          title: data.title || activeCommittee.selectedTitle,
          targetMembers: data.targetMembers,
        });
      } else {
        res = await openCommitteeRecruitment(activeCommittee.committeeId, {
          role: activeCommittee.selectedRole,
          targetMembers: data.targetMembers,
        });
      }

      toast.success(res?.message || "Recruitment opened successfully");

      setFormOpen(false);
      setActiveCommittee(null);

      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to open recruitment");
    }
  };

  // ================= CLOSE ONLY =================
  const handleCloseRecruitment = async (row) => {
    try {
      const res = await closeRecruitmentApi(row.id);

      toast.success(res?.message || "Closed successfully");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error closing recruitment");
    }
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
    {
      header: "Role",
      render: (row) => row.title || row.role,
    },
    {
      header: "Target",
      render: (row) => (
        <div>
          <p className=" text-muted-foreground">{row.targetMembers}</p>
        </div>
      ),
    },

    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-sm lowercase ${
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
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "NOT_EXIST" && (
            <Button
              size="sm"
              className="bg-blue-500 text-white"
              onClick={() => openRecruitmentForm(row, row.role)}
            >
              Open
            </Button>
          )}

          {row.status === "OPEN" && row.id && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleCloseRecruitment(row)}
            >
              Close
            </Button>
          )}

          {row.status === "CLOSED" && (
            <Button
              size="sm"
              className="bg-gray-500 hover:bg-gray-400 text-white"
              onClick={() => openRecruitmentForm(row, row.role)}
            >
              Reopen
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-white rounded">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  const executiveSection = groupedData[0];
  const committeesOnly = groupedData.slice(1);

  return (
    <div className="p-6 space-y-6">
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
      <div className="flex items-center gap-2">
        <button
          className={`px-4 py-2 rounded transition-colors duration-150 ${
            activeTab === "EXECUTIVE"
              ? "bg-primary text-white dark:bg-primary-dark dark:text-black"
              : "bg-gray-100 text-black dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setActiveTab("EXECUTIVE")}
        >
          Executive
        </button>

        <button
          className={`px-4 py-2 rounded transition-colors duration-150 ${
            activeTab === "COMMITTEES"
              ? "bg-primary text-white dark:bg-primary-dark dark:text-black"
              : "bg-gray-100 text-black dark:bg-gray-700 dark:text-white"
          }`}
          onClick={() => setActiveTab("COMMITTEES")}
        >
          Committees
        </button>
      </div>
      {activeTab === "EXECUTIVE" && (
        <div className="space-y-4">
          {executiveSection && (
            <div className="border rounded-lg p-4 ">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  {executiveSection.committeeName}
                </h2>
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90 text-white px-3 py-2 rounded-md"
                  onClick={() =>
                    openRecruitmentForm(
                      executiveSection.recruitments[0] || {
                        committeeId: null,
                        committeeName: "Executive",
                        role: "EXECUTIVE",
                      },
                      "EXECUTIVE",
                    )
                  }
                >
                  New Recruitment
                </Button>
              </div>
              <Table
                columns={columns}
                data={executiveSection.recruitments}
                extraProps={executiveSection}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "COMMITTEES" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {committeesOnly.map((committee) => (
            <div
              key={committee.committeeId}
              className="border rounded-lg p-4 bg-card"
            >
              <h2 className="text-lg font-semibold mb-2 ">
                {committee.committeeName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Manage recruitment for this committee
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/executive/recruitment/committee/${committee.committeeId}`,
                    )
                  }
                >
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
            title: activeCommittee.selectedTitle || "Web Master & Technical Director",
            targetMembers: activeCommittee.existing?.targetMembers || 1,
          }}
          fields={[
            {
              name: "role",
              label: "Role",
              type: "readonly",
            },
            ...(activeCommittee.selectedRole === "EXECUTIVE"
              ? [
                  {
                    name: "title",
                    label: "Executive Role Type",
                    type: "select",
                    options: [
                      { value: "Web Master & Technical Director", label: "Web Master & Technical Director" },
                      { value: "Treasurer", label: "Treasurer" },
                      { value: "Secretary", label: "Secretary" },
                      { value: "Chairman", label: "Chairman" },
                    ],
                  },
                ]
              : []),
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
