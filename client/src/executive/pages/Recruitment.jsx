import React, { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import api from "@/features/api";
import { getCommittees } from "@/features/committee/committee";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Recruitment() {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [committees, recruitmentsRes] = await Promise.all([
        getCommittees(),
        api.get("/executive/recruitment"),
      ]);

      const recruitments = recruitmentsRes.data;

      const grouped = committees.map((committee) => {
        const committeeRecruitments = recruitments.filter(
          (r) => r.committeeId === committee.id
        );

        return {
          committeeId: committee.id,
          committeeName: committee.name,
          recruitments: committeeRecruitments,
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

  const toggleStatus = async (row) => {
    try {
      if (row.status === "OPEN") {
        await api.post(`/executive/recruitment/${row.id}/close`);
        toast.success("Closed");
      } else {
        await api.post(`/executive/recruitment/${row.id}/open`);
        toast.success("Opened");
      }

      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const columns = [
    {
      header: "Role",
      accessor: "role",
    },
    {
      header: "Target",
      accessor: "targetMembers",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            row.status === "OPEN"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <Button
          size="sm"
          onClick={() => toggleStatus(row)}
          className={
            row.status === "OPEN"
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }
        >
          {row.status === "OPEN" ? "Close" : "Open"}
        </Button>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold">Recruitment Management</h1>

      {groupedData.map((committee) => (
        <div key={committee.committeeId} className="border rounded p-4">
          
          {/* Committee Title */}
          <h2 className="text-lg font-semibold mb-3">
            {committee.committeeName}
          </h2>

          {/* Empty state */}
          {committee.recruitments.length === 0 ? (
            <div className="text-gray-500">Not Exist</div>
          ) : (
            <Table columns={columns} data={committee.recruitments} />
          )}
        </div>
      ))}
    </div>
  );
}

export default Recruitment;