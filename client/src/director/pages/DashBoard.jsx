import React from "react";
// import { committee } from "../../data/committeeData";
import { dashboardStats } from "../../data/committeeData";
import CommitteeInfo from "../components/CommitteeInfo";
import StatsSection from "../components/StatsSection";
import { useEffect, useState } from "react";
import { getCommittee } from "../../features/committee";
function DashBoard() {
  const [committee, setCommittee] = useState(null);

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMUtKWkRYR0o1RjdBMzMyWFdDOEEzVFJZVCIsImVtYWlsIjoiZGlyZWN0b3JAZXhhbXBsZS5jb20iLCJyb2xlIjoiRElSRUNUT1IiLCJuYW1lIjoiRGVyZWsgRGlyZWN0b3IiLCJpYXQiOjE3NzM0MTM4MjMsImV4cCI6MTc3MzQxNzQyM30.ZAoyohz-6uccI5jQwOEZDoTBo8oDCOXkBBNPE-GLluc";

  const committeeId = "01KJZDXEV4YDQJ0JQP11GDRHW2";

  useEffect(() => {
    async function fetchCommittee() {
      const data = await getCommittee(committeeId, token);
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
