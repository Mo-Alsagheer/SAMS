import EditableTextArea from "@/components/shared/EditableTextArea";
import { updateCommitteeDescription } from "../../features/committee";
import { toast } from "sonner";

function CommitteeInfo({ committee, onSaveDescription }) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-3">
      <h2 className="text-xl font-semibold">{committee.name}</h2>

      <p className="text-muted-foreground">{committee.type}</p>

      <EditableTextArea
        label="Description"
        value={committee.description}
        onSave={onSaveDescription}
      />
    </div>
  );
}

export default CommitteeInfo;
