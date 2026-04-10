import React, { useEffect, useState } from "react";
import { z } from "zod";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  updateCommittee,
  getCommittee,
  getCommittees,
  deleteCommittee,
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
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openDeletePopup = (id) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setActionLoading(true);
      await deleteCommittee(selectedId);

      setCommittees((prev) => prev.filter((c) => c.id !== selectedId));

      toast.success("Committee deleted");
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setActionLoading(false);
      setDeleteOpen(false);
      setSelectedId(null);
    }
  };


  const handleEdit = async (committee) => {
    try {
      const fullCommittee = await getCommittee(committee.id);
      setEditingCommittee(fullCommittee);
      setPopupOpen(true);
    } catch (error) {
      toast.error("Failed to fetch committee:", error);
    }
  };

  const handleSubmit = async (data) => {
    if (!editingCommittee) return;

    try {
      await updateCommittee(editingCommittee.id, data);

      setCommittees((prev) =>
        prev.map((c) => (c.id === editingCommittee.id ? { ...c, ...data } : c)),
      );

      toast.success("Committee updated");
      setPopupOpen(false);
      setEditingCommittee(null);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const fetchCommittees = async () => {
    try {
      const data = await getCommittees();
      setCommittees(data);
    } catch (error) {
      toast.error("Failed to fetch committees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);
  const columns = React.useMemo(
    () => [
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
              disabled={actionLoading}
              onClick={() => openDeletePopup(row.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [actionLoading, handleEdit, openDeletePopup],
  );

  if (loading) return <div>Loading committees...</div>;

  return (
    <>
      <div className="mb-4 w-1/4">
        <AddCommittee onAdded={fetchCommittees} />
      </div>

      <Table columns={columns} data={committees} />

      <PopupForm
        key={editingCommittee?.id}
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setEditingCommittee(null);
        }}
        schema={committeeSchema}
        defaultValues={editingCommittee}
        fields={fields}
        onSubmit={handleSubmit}
        title="Edit Committee"
        submitLabel="Update"
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Committee"
        description="Are you sure you want to delete this committee?"
        confirmText="Delete"
        cancelText="Cancel"
        loading={actionLoading}
      />
    </>
  );
}

export default Committees;
