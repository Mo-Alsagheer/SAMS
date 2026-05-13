import React, { useState } from "react";
import TabButton from "../components/TabButton";
import DirectorApplications from "./DirectorApplications";
import ExecutiveApplications from "./ExecutiveApplications";

const TABS = [
  { key: "DIRECTOR", label: "Directors" },
  { key: "EXECUTIVE", label: "Executives" },
];

function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("DIRECTOR");

  return (
    <div className="p-6 space-y-6">
      <h1>Manage Applications </h1>
      {/* Tabs */}
      <div className="flex border-b gap-2">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Content */}
      {activeTab === "DIRECTOR" && <DirectorApplications />}
      {activeTab === "EXECUTIVE" && <ExecutiveApplications />}
    </div>
  );
}

export default ApplicationsPage;
