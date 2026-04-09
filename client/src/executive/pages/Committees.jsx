import React, { useEffect, useState } from "react";
import { z } from "zod";
import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import api from "@/features/api";
import { Button } from "@/components/ui/button";
import {
  updateCommittee,
  getCommittee,
} from "@/features/committee/committee";
import AddCommittee from "../components/AddCommittee";

const committeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["TECHNICAL", "OPERATION", "MEDIA"]),
  description: z.string().optional(),
  planID: z.string().optional(),
  membersCount: z.number().optional(),
  whatsappGroupLink: z.string().url().optional().or(z.literal("")),
});

const fields = [
  { name: "name", label: "Name", type: "text" },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["TECHNICAL", "OPERATION", "MEDIA"],
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "planID", label: "Plan ID", type: "text" },
  { name: "membersCount", label: "Members Count", type: "number" },
  { name: "whatsappGroupLink", label: "WhatsApp Group Link", type: "text" },
];

function Committees() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);

  useEffect(() => {
    async function fetchCommittees() {
      try {
        const res = await api.get("/committees");
        setCommittees(res.data);
      } catch (error) {
        console.error("Failed to fetch committees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommittees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this committee?"))
      return;
    try {
      await api.delete(`/committees/${id}`);
      setCommittees((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = async (committee) => {
    try {
      const fullCommittee = await getCommittee(committee.id);
      setEditingCommittee(fullCommittee);
      setPopupOpen(true);
    } catch (error) {
      console.error("Failed to fetch committee:", error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await updateCommittee(editingCommittee.id, data);

      setCommittees((prev) =>
        prev.map((c) =>
          c.id === editingCommittee.id ? { ...c, ...data } : c
        )
      );

      setPopupOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Members", accessor: "membersCount" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading committees...</div>;

  return (
    <>
      <div className="mb-4 w-1/4">
        <AddCommittee />
      </div>

      <Table columns={columns} data={committees} />

      <PopupForm
        key={editingCommittee?.id}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        schema={committeeSchema}
        defaultValues={editingCommittee}
        fields={fields}
        onSubmit={handleSubmit}
        title="Edit Committee"
        submitLabel="Update"
      />
    </>
  );
}

export default Committees;