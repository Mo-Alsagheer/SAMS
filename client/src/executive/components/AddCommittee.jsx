// import React, { useState } from "react";
// import { z } from "zod";
// import { PopupForm } from "@/components/shared/PopupForm";
// import { addCommittee } from "@/features/committee/committee";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// const committeeSchema = z.object({
//   name: z.string().min(3, "Name must be at least 3 characters"),
//   description: z.string(),
//   type: z.enum(["TECHNICAL", "NON-TECHNICAL", "EX-COMM", "MEDIA"]),
//   planID: z.string(),
//   directorIDs: z.string().min(1, "At least one director ID"),
//   membersCount: z.number().optional(),
//   whatsappGroupLink: z.string().url().optional(),
// });

// export default function AddCommittee() {
//   const [open, setOpen] = useState(false);

//   const handleAddCommittee = async (values) => {
//     const data = {
//       ...values,
//       directorIDs: values.directorIDs.split(",").map((id) => id.trim()),
//     };
//     await addCommittee(data);
//     console.log("Committee added:", data);
//     toast.success("Committee added successfully");
//   };

//   return (
//     <>
//       <Button
//         className="w-full justify-start"
//         variant="outline"
//         size="sm"
//         onClick={() => setOpen(true)}
//       >
//         Create Committee
//       </Button>

//       <PopupForm
//         open={open}
//         onClose={() => setOpen(false)}
//         schema={committeeSchema}
//         defaultValues={{
//           name: "",
//           description: "",
//           type: "TECHNICAL",
//         //   planID: "1",
//           directorIDs: "",
//         //   membersCount: 0,
//           whatsappGroupLink: "",
//         }}
//         fields={[
//           { name: "name", label: "Committee Name", type: "text" },
//           { name: "description", label: "Description", type: "textarea" },
//           {
//             name: "type",
//             label: "Committee Type",
//             type: "select",
//             options: ["TECHNICAL", "NON-TECHNICAL", "EX-COMM", "MEDIA"],
//           },
//         //   { name: "planID", label: "Plan ID", type: "text" },
//           {
//             name: "directorIDs",
//             label: "Director IDs (comma separated)",
//             type: "text",
//           },
//           {
//             name: "whatsappGroupLink",
//             label: "WhatsApp Group Link",
//             type: "text",
//           },
//         ]}
//         submitLabel="Create Committee"
//         onSubmit={handleAddCommittee}
//         title="Add New Committee"
//       />
//     </>
//   );
// }
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
  type: z.enum(["TECHNICAL", "NON-TECHNICAL", "EX-COMM", "MEDIA"]),
  planID: z.string(),
  directorIDs: z.string().min(1, "At least one director ID"),
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
    options: ["TECHNICAL", "NON-TECHNICAL", "EX-COMM", "MEDIA"],
  },
  {
    name: "directorIDs",
    label: "Director IDs",
    type: "text",
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
  const handleAddCommittee = useCallback(
    async (values) => {
      const { directorIDs, ...rest } = values;
      const data = {
        ...rest,
        directorIDs: directorIDs.split(",").map((id) => id.trim()),
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
    },
    []
  );

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
          directorIDs: "",
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