import React, { useEffect, useState } from "react";
import { Users, UserCheck, Activity, Trash2, Mail, Phone } from "lucide-react";
import StatCard from "../../components/shared/StatCard";
import Table from "../../components/shared/Table";
import { toast } from "sonner";

// استيراد الدوال الـ API
import { getUserProfile, getCommitteeScoreboard } from "@/features/member/member";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommitteeData = async () => {
      try {
        setLoading(true);
        
        // 1. جلب بيانات المخرج الحالي
        const profile = await getUserProfile();
        
        if (profile?.committeeId) {
          // 2. جلب أعضاء اللجنة
          const response = await getCommitteeScoreboard(profile.committeeId);
          
          // 🔍 استخراج المصفوفة (Array) بشكل آمن تماماً مهما كان شكل الريسبونس من الباك إند
          let extractedMembers = [];
          if (Array.isArray(response)) {
            extractedMembers = response;
          } else if (response && Array.isArray(response.data)) {
            extractedMembers = response.data;
          } else if (response && Array.isArray(response.members)) {
            extractedMembers = response.members;
          }

          // تعيين المصفوفة للـ State لتغذية الجدول
          setMembers(extractedMembers);
        }
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load committee members";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteeData();
  }, []);

  // دالة الحذف تعمل Local حالياً لحين ربط الـ Endpoint
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted successfully (Local update)");
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
            {row.image ? <img src={row.image} alt="" /> : (row.name ? row.name.charAt(0) : "U")}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm">{row.name || "Unknown Member"}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {row.role || "Member"} {row.academicLevel ? `• ${row.academicLevel}` : ""}
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
          <span className="text-xs">{row.email || "N/A"}</span>
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
          <span className="text-xs">{row.phone || "No phone added"}</span>
        </div>
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
          Manage, oversee, and audit all students and faculty members in the system.
        </p>
      </div>

      {/* الـ Stat Cards ثابتة حالياً بناءً على عدد الأعضاء في الجدول */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="TOTAL MEMBERS"
            value={loading ? "..." : members.length}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="ACTIVE MEMBERS"
            value={loading ? "..." : members.filter(m => m.status === "active").length || members.length}
            icon={UserCheck}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="COMMITTEE HUB"
            value={loading ? "..." : "Active"}
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