import React, { useEffect, useState } from "react";
import { Users, UserCheck, Activity, Trash2, Mail, Phone } from "lucide-react";
import StatCard from "../../components/shared/StatCard";
import Table from "../../components/shared/Table";
import { toast } from "sonner";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockData = [
    {
      id: 1,
      name: "Alexander Dubois",
      role: "Undergraduate",
      year: "Year 3",
      email: "a.dubois@sams-edu.org",
      phone: "+1 (555) 012-3456",
      score: 94.8,
      image: null,
    },
    {
      id: 2,
      name: "Elena Kovac",
      role: "Post-Grad",
      year: "Year 1",
      email: "elena.k@sams-edu.org",
      phone: "+1 (555) 234-5678",
      score: 78.2,
      image: null,
    },
    {
      id: 3,
      name: "Julian Marcus",
      role: "Undergraduate",
      year: "Year 4",
      email: "j.marcus@sams-edu.org",
      phone: "+1 (555) 890-1234",
      score: 91.5,
      image: null,
    },
    {
      id: 4,
      name: "Sarah Chen",
      role: "Faculty",
      year: "Associate Prof.",
      email: "s.chen@sams-edu.org",
      phone: "+1 (555) 456-7890",
      score: null,
      image: null,
    },
    {
      id: 5,
      name: "Thomas Wright",
      role: "Undergraduate",
      year: "Year 2",
      email: "t.wright@sams-edu.org",
      phone: "+1 (555) 321-0987",
      score: 88.9,
      image: null,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setMembers(mockData);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted successfully");
    }
  };

  const columns = [
    {
      header: "MEMBER NAME",
      accessor: "name",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 overflow-hidden">
            {row.image ? <img src={row.image} alt="" /> : row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {row.role} • {row.year}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "EMAIL ADDRESS",
      accessor: "email",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Mail size={14} />
          <span className="text-xs">{row.email}</span>
        </div>
      ),
    },
    {
      header: "PHONE NUMBER",
      accessor: "phone",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Phone size={14} />
          <span className="text-xs">{row.phone}</span>
        </div>
      ),
    },
    {
      header: "TOTAL SCORE",
      accessor: "score",
      sortable: false,
      render: (row) => (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            row.score
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {row.score || "N/A"}
        </span>
      ),
    },
    {
      header: "ACTIONS",
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-blue-900 tracking-tight">
          Members
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Manage, oversee, and audit all students and faculty members in the
          system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="TOTAL STUDENTS"
            value="1,284"
            icon={Users}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="ACTIVE THIS WEEK"
            value="942"
            icon={UserCheck}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="AVG. PERFORMANCE"
            value="84.2"
            icon={Activity}
            color="primary"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_50px_rgba(59,130,246,0.15)] overflow-hidden">
        <Table
          columns={columns}
          data={members}
          loading={loading}
          rowsPerPage={5}
        />
      </div>
    </div>
  );
}
