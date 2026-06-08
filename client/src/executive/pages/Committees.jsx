import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Table from "@/components/shared/Table";
import { PopupForm } from "@/components/shared/PopupForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SearchBar from "@/components/shared/SearchBar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

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
  const [search, setSearch] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

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
      const message =
        error?.response?.data?.message || "Failed to delete committee";
      toast.error(message);
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

  const filteredCommittees = React.useMemo(() => {
    if (!search) return committees;
    const q = search.toLowerCase();
    return committees.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.type || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q),
    );
  }, [committees, search]);
  const columns = React.useMemo(
    () => [
      { header: "Name", accessor: "name" },
      { header: "Type", accessor: "type" },
      { header: "Members", accessor: "membersCount" },
      {
        header: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            {" "}
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/executive/committees/${row.id}`)}
            >
              View
            </Button>
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

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  return (
    <>
      <div className="mb-6 flex flex-col  justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Manage Committees</h1>
          <Badge>{committees.length}</Badge>
        </div>

        <div className="flex items-center gap-4 w-2/3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search committees..."
          />
          <div className="ml-auto">
            <AddCommittee onAdded={fetchCommittees} />
          </div>
        </div>
      </div>

      {filteredCommittees.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No committees found.
          <div className="mt-4">
            <AddCommittee onAdded={fetchCommittees} />
          </div>
        </div>
      ) : (
        <Table columns={columns} data={filteredCommittees} />
      )}

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
