import EditableTextArea from "@/components/shared/EditableTextArea";

function CommitteeInfo({ committee }) {

  const handleSaveDescription = (newText) => {
    console.log("save to api", newText);
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