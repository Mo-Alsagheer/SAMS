import React from "react";
import { committee } from "../../data/committeeData";
import { dashboardStats } from "../../data/committeeData";
import CommitteeInfo from "../components/CommitteeInfo";
import StatsSection from "../components/StatsSection";
function DashBoard() {
  return (
    <div className="space-y-6 ">
      <CommitteeInfo committee={committee} />
      {/* Stats Section */}

      <StatsSection stats={dashboardStats} />
    </div>
  );
}

export default DashBoard;
