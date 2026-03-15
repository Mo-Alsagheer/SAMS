import EditableTextArea from "@/components/shared/EditableTextArea";
import { updateCommitteeDescription } from "../../features/committee";
import { toast } from "sonner";

function CommitteeInfo({ committee }) {
  const handleSaveDescription = async (newText) => {
    try {
      await updateCommitteeDescription(committee.id, newText);

      toast("Description updated", { position: "top-center" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 space-y-3">
      <h2 className="text-xl font-semibold">{committee.name}</h2>

      <p className="text-muted-foreground">{committee.season}</p>

      <EditableTextArea
        label="Description"
        value={committee.description}
        onSave={handleSaveDescription}
      />
    </div>
  );
}

export default CommitteeInfo;
