import React, { useState, useCallback } from "react";
import { z } from "zod";
import { PopupForm } from "@/components/shared/PopupForm";
import { addCommittee } from "@/features/committee/committee";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 1. Schema with Zod
const committeeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string(),
  type: z.enum(["TECHNICAL", "OPERATION", "MEDIA"]),
  planID: z.string(),
  membersCount: z.number().optional(),
  whatsappGroupLink: z.string().url().optional(),
});

// 2. Type inferred from schema

// 3. Reusable field definitions
const committeeFields = [
  { name: "name", label: "Committee Name", type: "text" },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "type",
    label: "Committee Type",
    type: "select",
    options: ["TECHNICAL", "OPERATION", "MEDIA"],
  },

  {
    name: "whatsappGroupLink",
    label: "WhatsApp Group Link",
    type: "text",
  },
];

export default function AddCommittee() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 4. Form submission handler
  const handleAddCommittee = useCallback(async (values) => {
    const {  ...rest } = values;
    const data = {
      ...rest
    };

    setLoading(true);
    try {
      await addCommittee(data);
      toast.success("Committee added successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add committee. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Button
        className="w-full justify-start"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Create Committee
      </Button>

      <PopupForm
        open={open}
        onClose={() => setOpen(false)}
        schema={committeeSchema}
        defaultValues={{
          name: "",
          description: "",
          type: "TECHNICAL",
          planID: "",
          membersCount: undefined,
          whatsappGroupLink: "",
        }}
        fields={committeeFields}
        submitLabel={loading ? "Creating..." : "Create Committee"}
        onSubmit={handleAddCommittee}
        title="Add New Committee"
        disabled={loading} // prevent multiple submissions
      />
    </>
  );
}
