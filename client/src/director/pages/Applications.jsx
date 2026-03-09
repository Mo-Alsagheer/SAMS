import React, { useState } from "react";
import SearchBar from "../../components/shared/SearchBar";
import FilterDropdown from "../../components/shared/FilterDropdown";
import Table from "../../components/shared/Table";

function Applications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const applicationsFields = [
    {
      header: "Applicant",
      accessor: "applicant",
    },
    {
      header: "Status",
      accessor: "status",
    },
    {
      header: "Applied",
      accessor: "applied",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const statusOptions = [
    "All",
    "Pending",
    "Interviewing",
    "Accepted",
    "Rejected",
  ];
  const applicationsData = [
    { applicant: "Mariam", status: "Pending", applied: "2026-03-09" },
    { applicant: "sara", status: "Accepted", applied: "2026-03-05" },
    { applicant: "ganna", status: "Accepted", applied: "2026-03-05" },
  ];

  const filteredData = applicationsData.filter((item) => {
    return (
      (status === "All" || item.status === status) &&
      item.applicant.toLowerCase().includes(search.toLowerCase())
    );
  });
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} className="bg-white" />

        <FilterDropdown
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />
      </div>
      <Table columns={applicationsFields} data={filteredData} />
    </div>
  );
}

export default Applications;
