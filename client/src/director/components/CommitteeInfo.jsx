import { Button } from "@/components/ui/button";

function CommitteeInfo({ committee }) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-3">
      <h2 className="text-xl font-semibold">{committee.name}</h2>

      <p className="text-muted-foreground">{committee.season}</p>

      <div className="space-y-2">
        <p className="font-medium">Description</p>

        <div className="flex gap-3 items-start">
          <p className="bg-muted p-3 rounded-md flex-1">
            {committee.description}
          </p>
          <Button className={"bg-sky-600 hover:bg-sky-800 cursor-pointer"}>
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CommitteeInfo;
