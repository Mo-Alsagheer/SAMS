import React, { useEffect, useState } from "react";
import Table from "@/components/shared/Table";
import api from "@/features/api";
import { getCommittee } from "@/features/committee/committee";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Recruitment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // new states
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [members, setMembers] = useState([]);

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

  // toggle open / close
  const toggleStatus = async (row) => {
    const updatedStatus = row.status === "OPEN" ? "CLOSED" : "OPEN";

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

      toast.success(`Committee successfully ${action}`);
    } catch (err) {
      console.error(err);

      setData((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: row.status } : item,
        ),
      );

      toast.error("Something went wrong");
    }
  };

  // open details
  const openDetails = async (row) => {
    setSelectedCommittee(row);

    try {
      const [directorsRes, membersRes] = await Promise.all([
        api.get(`/executive/committees/${row.committeeId}/directors`),
        api.get(`/executive/committees/${row.committeeId}/members`),
      ]);

      setDirectors(directorsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load committee users");
    }
  };

  // accept
  const handleAccept = async (userId) => {
    try {
      await api.post(`/executive/users/${userId}/accept`);
      toast.success("User accepted");
    } catch {
      toast.error("Error accepting user");
    }
  };

  // reject
  const handleReject = async (userId) => {
    try {
      await api.post(`/executive/users/${userId}/reject`);
      toast.success("User rejected");
    } catch {
      toast.error("Error rejecting user");
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
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => toggleStatus(row)}
            className={` text-white ${
              row.status === "OPEN"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {row.status === "OPEN" ? "Close" : "Open"}
          </Button>

          <Button variant="default" size="sm" onClick={() => openDetails(row)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Recruitment Management</h1>

      <Table columns={columns} data={data} />

      {/* Details Section */}
      {selectedCommittee && (
        <div className="mt-6 bg-white border p-4 rounded">
          <h2 className="font-semibold mb-3">
            {selectedCommittee.committeeName}
          </h2>

          {/* Directors */}
          <h3 className="font-medium">Directors</h3>
          {directors.map((director) => (
            <div
              key={director.id}
              className="flex justify-between border p-2 rounded mb-2"
            >
              <span>{director.name}</span>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAccept(director.id)}
                >
                  Accept
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => handleReject(director.id)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}

          {/* Members */}
          <h3 className="font-medium mt-4">Members</h3>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between border p-2 rounded mb-2"
            >
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recruitment;
