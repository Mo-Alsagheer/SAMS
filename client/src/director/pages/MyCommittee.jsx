import React from "react";
import CommitteeCard from "../components/committee-card";

function MyCommittee() {
  const committee = {
    name: "Marketing",
    members: 24,
    year: 2024,
    description:
      "The marketing committee is responsible for promoting events and managing social media.",
  };
  return (
    <div>
      <CommitteeCard committeeInfo={committee} />
    </div>
  );
}

export default MyCommittee;
