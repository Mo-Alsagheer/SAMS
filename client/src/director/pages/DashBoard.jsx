import React from "react";
// import { committee } from "../../data/committeeData";
import { dashboardStats } from "../../data/committeeData";
import CommitteeInfo from "../components/CommitteeInfo";
import StatsSection from "../components/StatsSection";
import { useEffect, useState } from "react";
import { getCommittee } from "../../features/committee";
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

  if (!committee) return <p>Loading...</p>;

  return (
    <div className="space-y-6 ">
      <CommitteeInfo committee={committee} />
      {/* Stats Section */}

      <StatsSection stats={dashboardStats} />
    </div>
  );
}

export default DashBoard;
