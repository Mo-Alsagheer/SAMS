import { useState } from "react";
import { Button } from "@/components/ui/button";

function EditableTextArea({ value, onSave, label }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleSave = () => {
    onSave(text);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      {label && <p className="font-medium">{label}</p>}

      {!isEditing ? (
        <div className="flex gap-3 items-start">
          <p className="bg-muted p-3 rounded-md flex-1">
            {text || "No description yet"}
          </p>

          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            className="w-full border rounded-md p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>

            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditableTextArea;
