import React, { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import api from "@/features/api";
import { getCommittee } from "@/features/committee/committee";
import { toast } from "sonner";

function Recruitment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/executive/recruitment");

      const recruitments = res.data;

      const fullData = await Promise.all(
        recruitments.map(async (item) => {
          try {
            const committee = await getCommittee(item.committeeId);

            return {
              ...item,
              committeeName: committee.name,
            };
          } catch {
            return {
              ...item,
              committeeName: "Unknown",
            };
          }
        }),
      );

      setData(fullData);
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
    const updatedStatus = row.status === "OPEN" ? "CLOSED" : "OPEN";

    // optimistic UI
    setData((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: updatedStatus } : item,
      ),
    );

    const action = row.status === "OPEN" ? "closed" : "opened";

    try {
      if (row.status === "OPEN") {
        await api.post(`/executive/recruitment/${row.committeeId}/close`);
      } else {
        await api.post(`/executive/recruitment/${row.committeeId}/open`);
      }

      // ✅ success toast
      toast.success(`Committee successfully ${action} `);
    } catch (err) {
      console.error(err);

      // rollback
      setData((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: row.status } : item,
        ),
      );

      // ❌ error toast
      toast.error(err?.response?.data?.message || "Something went wrong ");
    }
  };

  const columns = [
    {
      header: "Committee",
      accessor: "committeeName",
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
      header: "Opened At",
      accessor: "openedAt",
      render: (row) => new Date(row.openedAt).toLocaleDateString("en-GB"),
    },
    {
      header: "Closed At",
      accessor: "closedAt",
      render: (row) =>
        row.closedAt ? new Date(row.closedAt).toLocaleDateString("en-GB") : "-",
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => toggleStatus(row)}
          className={`px-3 py-1 rounded text-white ${
            row.status === "OPEN"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {row.status === "OPEN" ? "Close" : "Open"}
        </button>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Recruitment Management</h1>

      <Table columns={columns} data={data} />
    </div>
  );
}

export default Recruitment;
