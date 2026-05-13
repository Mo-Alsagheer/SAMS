import React from "react";
// import { committee } from "../../data/committeeData";
import { dashboardStats } from "../../data/committeeData";
import CommitteeInfo from "../components/CommitteeInfo";
import StatsSection from "../components/StatsSection";
import { useEffect, useState } from "react";
import {
  directorUpdateCommittee,
  getCommittee,
} from "@/features/committee/committee";
import { toast } from "sonner";
import { getCurrentUser } from "@/features/auth/session";
function DashBoard() {
  const [committee, setCommittee] = useState(null);

  const user = getCurrentUser();
  const committeeId = user?.committeeId || "";

  useEffect(() => {
    async function fetchCommittee() {
      const data = await getCommittee(committeeId);
      setCommittee(data);
    }

    fetchCommittee();
  }, []);

  const handleUpdateDescription = async (newText) => {
    try {
      const updated = await directorUpdateCommittee(committee.id, {
        description: newText,
      });

      setCommittee((prev) => ({
        ...prev,
        description: updated.description,
      }));

      toast.success("Description updated", {
        position: "top-center",
      });
    } catch (err) {
      console.error(err);

      toast.error("Failed to update description", {
        position: "top-center",
      });
    }
  };

  if (!committee) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <StatsSection stats={dashboardStats} />
      <CommitteeInfo
        committee={committee}
        onSaveDescription={handleUpdateDescription}
      />
    </div>
  );
}

export default DashBoard;
