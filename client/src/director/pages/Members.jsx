import React, { useEffect, useState } from "react";
import { Users, Calendar, ListTodo, Mail, Phone, Award } from "lucide-react";
import StatCard from "../../components/shared/StatCard";
import Table from "../../components/shared/Table";
import { toast } from "sonner";

// استيراد الدوال من الـ API الفعلي
import { getCommitteeMembers, updateMemberStatus, getCommitteeStatistics } from "@/features/member/member"; 

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حفظ هيكل الريسبونس الكامل
  const [stats, setStats] = useState({
    totalMembers: 0,
    active: 0,
    hold: 0,
    fired: 0,
    attendance: {
      totalSessions: 0,
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
      averageAttendanceRate: 0
    },
    tasks: {
      totalAssignedTasks: 0,
      totalSubmissions: 0,
      submissionRate: 0,
      averageTaskScore: 0
    }
  });

  const fetchCommitteeData = async () => {
    try {
      setLoading(true);
      
      const [membersResponse, statsResponse] = await Promise.all([
        getCommitteeMembers(),
        getCommitteeStatistics()
      ]);

      // 1. معالجة بيانات الجدول
      let extractedMembers = [];
      if (Array.isArray(membersResponse)) {
        extractedMembers = membersResponse;
      } else if (membersResponse && Array.isArray(membersResponse.data)) {
        extractedMembers = membersResponse.data;
      } else if (membersResponse && Array.isArray(membersResponse.members)) {
        extractedMembers = membersResponse.members;
      }

      const membersWithIds = extractedMembers.map((member, index) => ({
        ...member,
        id: member.id || String(index + 1)
      }));
      setMembers(membersWithIds);

      // 2. معالجة وحفظ الريسبونس جوه الـ State
      if (statsResponse) {
        setStats({
          totalMembers: statsResponse.totalMembers || 0,
          active: statsResponse.byStatus?.active || 0,
          hold: statsResponse.byStatus?.hold || 0,
          fired: statsResponse.byStatus?.fired || 0,
          attendance: {
            totalSessions: statsResponse.attendance?.totalSessions || 0,
            totalPresent: statsResponse.attendance?.totalPresent || 0,
            totalLate: statsResponse.attendance?.totalLate || 0,
            totalAbsent: statsResponse.attendance?.totalAbsent || 0,
            averageAttendanceRate: statsResponse.attendance?.averageAttendanceRate || 0
          },
          tasks: {
            totalAssignedTasks: statsResponse.tasks?.totalAssignedTasks || 0,
            totalSubmissions: statsResponse.tasks?.totalSubmissions || 0,
            submissionRate: statsResponse.tasks?.submissionRate || 0,
            averageTaskScore: statsResponse.tasks?.averageTaskScore || 0
          }
        });
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      const message = error?.response?.data?.message || "Failed to load committee components";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitteeData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const backendStatusValue = newStatus === "on hold" ? "hold" : newStatus;
      await updateMemberStatus(id, backendStatusValue);
      toast.success(`Member status updated to ${newStatus} successfully`);
      fetchCommitteeData(); 
    } catch (error) {
      console.error("Failed to update status:", error);
      const message = error?.response?.data?.message || "Failed to update member status";
      toast.error(message);
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900";
      case "on hold":
      case "hold":
      case "onhold":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
      case "fired":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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
            {row.name ? row.name.charAt(0) : "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{row.name || "Unknown Member"}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {row.role || "Member"}
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
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
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
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Phone size={14} />
          <span className="text-xs">{row.phone || "No phone added"}</span>
        </div>
      ),
    },
    {
      header: "SCORE",
      accessor: "score",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Award size={15} className="text-amber-500 shrink-0" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
            {row.score !== undefined ? row.score : 0}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Pts</span>
        </div>
      ),
    },
    {
      header: "STATUS",
      accessor: "status",
      sortable: false,
      render: (row) => {
        let currentStatus = row.status?.toLowerCase();
        if (currentStatus === "hold" || currentStatus === "onhold") {
          currentStatus = "on hold";
        } else if (!currentStatus) {
          currentStatus = "active";
        }
        
        return (
          <div className="relative inline-block">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(row.id, e.target.value)}
              className={`appearance-none font-bold text-xs px-3 py-1.5 pr-8 rounded-full border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 capitalize tracking-wide ${getStatusStyles(currentStatus)}`}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "12px"
              }}
            >
              <option value="active" className="text-green-700 bg-white dark:bg-slate-900 font-semibold">Active</option>
              <option value="on hold" className="text-amber-700 bg-white dark:bg-slate-900 font-semibold">On Hold</option>
              <option value="fired" className="text-rose-700 bg-white dark:bg-slate-900 font-semibold">Fired</option>
            </select>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-blue-900 dark:text-blue-400 tracking-tight">
          Members Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          Monitor performance parameters, attendance analytics, and task assignments.
        </p>
      </div>

      {/* الـ 3 كروت المظبوطة بالعناوين المطلوبة بالملّي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="TOTAL MEMBERS"
            value={loading ? "..." : stats.totalMembers}
            icon={Users}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="ATTENDANCE"
            value={loading ? "..." : `${stats.attendance.averageAttendanceRate}%`}
            icon={Calendar}
            color="primary"
          />
        </div>
        <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
          <StatCard
            title="TASKS"
            value={loading ? "..." : `${stats.tasks.submissionRate}% Rate`}
            icon={ListTodo}
            color="primary"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(59,130,246,0.15)] overflow-hidden">
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