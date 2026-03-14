import EditableTextArea from "@/components/shared/EditableTextArea";
import { updateCommitteeDescription } from "../../features/committee";

function CommitteeInfo({ committee }) {
  const token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMUtKWkRYR0o1RjdBMzMyWFdDOEEzVFJZVCIsImVtYWlsIjoiZGlyZWN0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiRElSRUNUT1IiLCJuYW1lIjoiRGVyZWsgRGlyZWN0b3IiLCJpYXQiOjE3NzM0NDAzNTAsImV4cCI6MTc3MzQ0Mzk1MH0.9WtPpCubq6oV3eRuGpDLUG4KKwgs-b5WGyaaEWlPnFg";

  const handleSaveDescription = async (newText) => {
    try {
      await updateCommitteeDescription(committee.id, newText, token);

      alert("Description updated");
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
