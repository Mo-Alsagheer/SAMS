"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Users, UserCheck, UserMinus, Activity, Save, Loader2, Mail } from "lucide-react";
import StatCard from "../../components/shared/StatCard";
import Table from "../../components/shared/Table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSessionAttendance, markSessionAttendance } from "@/features/attendance/attendance";

export default function Attendance() {
  const { sessionId } = useParams();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSessionAttendance(sessionId);
        setMembers(data.members || []);
        setStats(data.statistics || {});
      } catch (error) {
        console.error("Error loading attendance:", error);
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId]);

  const handleStatusChange = (userId, newStatus) => {
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, attended: newStatus } : m))
    );
  };

  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      const payload = {
        members: members.map((m) => ({
          userId: m.userId,
          attended: (m.attended || "absent").toLowerCase(),
          score: m.score || 0,
        })),
      };

      await markSessionAttendance(sessionId, payload);
      toast.success("Attendance updated successfully! ");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Member Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="font-medium text-slate-700 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Email Address",
      accessor: "email",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Mail size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <select
          value={row.attended || "absent"}
          onChange={(e) => handleStatusChange(row.userId, e.target.value)}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-none cursor-pointer focus:ring-0 ${
            (row.attended || "").toLowerCase() === "present"
              ? "bg-emerald-50 text-emerald-600"
              : (row.attended || "").toLowerCase() === "late"
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-10 min-h-screen font-sans">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Attendance</h1>
          <p className="text-slate-500 text-sm mt-2">Monitor and manage real-time member attendance.</p>
        </div>
        <Button onClick={handleSubmitAttendance} disabled={loading} className="bg-primary hover:bg-blue-900 text-white flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Submit Attendance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="TOTAL MEMBERS" value={stats.totalMembers || 0} icon={Users} color="primary" />
        <StatCard title="PRESENT" value={stats.presentCount || 0} icon={UserCheck} color="primary" />
        <StatCard title="ABSENT" value={stats.absentCount || 0} icon={UserMinus} color="primary" />
        <StatCard title="ATTENDANCE RATE" value={`${stats.attendanceRate || 0}%`} icon={Activity} color="primary" />
      </div>

      <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <Table columns={columns} data={members} loading={loading} rowsPerPage={10} />
      </div>
    </div>
  );
}