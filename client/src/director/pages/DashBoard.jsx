import React from "react";
// import { committee } from "../../data/committeeData";
import { dashboardStats } from "../../data/committeeData";
import CommitteeInfo from "../components/CommitteeInfo";
import StatsSection from "../components/StatsSection";
import { useEffect, useState } from "react";
import { getCommittee, updateCommitteeDescription } from "../../features/committee/committee";
import { toast } from "sonner";
function DashBoard() {
  const [committee, setCommittee] = useState(null);

  const committeeId = "01KJZDXEV4YDQJ0JQP11GDRHW2";

  useEffect(() => {
    async function fetchCommittee() {
      const data = await getCommittee(committeeId);
      setCommittee(data);
    }

    fetchCommittee();
  }, []);

  const handleUpdateDescription = async (newText) => {
    try {
      const updated = await updateCommitteeDescription(committee.id, newText);

      setCommittee((prev) => ({
        ...prev,
        description: updated.description,
      }));

      toast("Description updated", { position: "top-center" });
    } catch (err) {
      console.error(err);
    }
  };

  if (!committee) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <CommitteeInfo
        committee={committee}
        onSaveDescription={handleUpdateDescription}
      />

      <StatsSection stats={dashboardStats} />
    </div>
  );
}

export default DashBoard;
