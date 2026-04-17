import React, { useState } from "react";
import SearchBar from "../../components/shared/SearchBar";
import FilterDropdown from "../../components/shared/FilterDropdown";
import Table from "../../components/shared/Table";
import { useNavigate } from "react-router-dom";

function Applications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const navigate = useNavigate();
  const applicationsFields = [
    {
      header: "Applicant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.photo}
            alt={row.applicant}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <p className="font-medium">{row.applicant}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },

    {
      header: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm
        ${
          row.status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : row.status === "Accepted"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
        }`}
        >
          {row.status}
        </span>
      ),
    },

    {
      header: "Applied",
      accessor: "applied",
    },

    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <button
            on
            onClick={() => navigate(`/director/applications/${row.id}`)}
            className="text-blue-600 hover:underline"
          >
            View
          </button>

          <button className="text-green-600 hover:underline">Accept</button>

          <button className="text-red-600 hover:underline">Reject</button>
        </div>
      ),
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
    {
      id: 1,
      applicant: "Layla Hassan",
      email: "layla.hassan@uni.edu",
      photo: "https://i.pravatar.cc/40?img=1",
      status: "Pending",
      applied: "2026-03-09",
    },
    {
      id: 2,
      applicant: "Sara Ahmed",
      email: "sara.ahmed@uni.edu",
      photo: "https://i.pravatar.cc/40?img=2",
      status: "Accepted",
      applied: "2026-03-05",
    },
    {
      id: 3,
      applicant: "Layan Khaled",
      email: "layan.khaled@uni.edu",
      photo: "https://i.pravatar.cc/40?img=3",
      status: "Interviewing",
      applied: "2026-03-11",
    },
    {
      id: 4,
      applicant: "Arwa Mostafa",
      email: "arwa.mostafa@uni.edu",
      photo: "https://i.pravatar.cc/40?img=4",
      status: "Rejected",
      applied: "2026-02-28",
    },
    {
      id: 5,
      applicant: "Omar Adel",
      email: "omar.adel@uni.edu",
      photo: "https://i.pravatar.cc/40?img=5",
      status: "Accepted",
      applied: "2026-03-02",
    },
    {
      id: 6,
      applicant: "Nour Ali",
      email: "nour.ali@uni.edu",
      photo: "https://i.pravatar.cc/40?img=6",
      status: "Pending",
      applied: "2026-03-12",
    },
    {
      id: 7,
      applicant: "Youssef Mahmoud",
      email: "youssef.mahmoud@uni.edu",
      photo: "https://i.pravatar.cc/40?img=7",
      status: "Interviewing",
      applied: "2026-03-08",
    },
    {
      id: 8,
      applicant: "Hana Samir",
      email: "hana.samir@uni.edu",
      photo: "https://i.pravatar.cc/40?img=8",
      status: "Pending",
      applied: "2026-03-06",
    },
    {
      id: 9,
      applicant: "Kareem Tarek",
      email: "kareem.tarek@uni.edu",
      photo: "https://i.pravatar.cc/40?img=9",
      status: "Rejected",
      applied: "2026-02-25",
    },
    {
      id: 10,
      applicant: "Salma Ibrahim",
      email: "salma.ibrahim@uni.edu",
      photo: "https://i.pravatar.cc/40?img=10",
      status: "Accepted",
      applied: "2026-03-03",
    },
    {
      id: 11,
      applicant: "Ali Hassan",
      email: "ali.hassan@uni.edu",
      photo: "https://i.pravatar.cc/40?img=11",
      status: "Pending",
      applied: "2026-03-10",
    },
    {
      id: 12,
      applicant: "Farah Nabil",
      email: "farah.nabil@uni.edu",
      photo: "https://i.pravatar.cc/40?img=12",
      status: "Interviewing",
      applied: "2026-03-07",
    },
    {
      id: 13,
      applicant: "Ahmed Samy",
      email: "ahmed.samy@uni.edu",
      photo: "https://i.pravatar.cc/40?img=13",
      status: "Accepted",
      applied: "2026-03-04",
    },
    {
      id: 14,
      applicant: "Mona Khaled",
      email: "mona.khaled@uni.edu",
      photo: "https://i.pravatar.cc/40?img=14",
      status: "Rejected",
      applied: "2026-02-22",
    },
    {
      id: 15,
      applicant: "Tarek Fathy",
      email: "tarek.fathy@uni.edu",
      photo: "https://i.pravatar.cc/40?img=15",
      status: "Pending",
      applied: "2026-03-13",
    },
    {
      id: 16,
      applicant: "Nadine Yasser",
      email: "nadine.yasser@uni.edu",
      photo: "https://i.pravatar.cc/40?img=16",
      status: "Interviewing",
      applied: "2026-03-01",
    },
    {
      id: 17,
      applicant: "Mohamed Ashraf",
      email: "mohamed.ashraf@uni.edu",
      photo: "https://i.pravatar.cc/40?img=17",
      status: "Accepted",
      applied: "2026-03-02",
    },
    {
      id: 18,
      applicant: "Aya Gamal",
      email: "aya.gamal@uni.edu",
      photo: "https://i.pravatar.cc/40?img=18",
      status: "Pending",
      applied: "2026-03-14",
    },
    {
      id: 19,
      applicant: "Yara Mostafa",
      email: "yara.mostafa@uni.edu",
      photo: "https://i.pravatar.cc/40?img=19",
      status: "Rejected",
      applied: "2026-02-20",
    },
    {
      id: 20,
      applicant: "Hassan Ali",
      email: "hassan.ali@uni.edu",
      photo: "https://i.pravatar.cc/40?img=20",
      status: "Accepted",
      applied: "2026-03-06",
    },
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
