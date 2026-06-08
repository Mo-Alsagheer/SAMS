import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // إضافة useParams لجلب الـ id من الرابط
import { Users, UserCheck, UserMinus, Activity } from "lucide-react";
import StatCard from "../../components/shared/StatCard";
import Table from "../../components/shared/Table";
import { toast } from "sonner";

export default function Attendance() {
  const { sessionId } = useParams(); // استلام الـ id من الـ URL
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockData = [
    {
      id: "SAMS-2023-001",
      name: "Julianna Smith",
      status: "Present",
    },
    {
      id: "SAMS-2023-002",
      name: "Alexander Dubois",
      status: "Absent",
    },
    {
      id: "SAMS-2023-003",
      name: "Elena Kovac",
      status: "Late",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       
        await new Promise((resolve) => setTimeout(resolve, 600));
        setMembers(mockData);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "Failed to load attendance data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]); 

  const columns = [
    {
      header: "Member Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium text-slate-700 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Member ID",
      accessor: "id",
      render: (row) => <span className="text-slate-500 text-sm">{row.id}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const statusStyles = {
          Present: "bg-emerald-50 text-emerald-500",
          Absent: "bg-rose-50 text-rose-500",
          Late: "bg-amber-50 text-amber-500",
        };
        
        return (
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${statusStyles[row.status] || "bg-slate-50 text-slate-500"}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex justify-center">
            <input 
                type="checkbox" 
                defaultChecked={row.status === "Present" || row.status === "Late"}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-10 min-h-screen font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-50 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Live</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Session ID: #{sessionId || "29402"}
            </span>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
          Attendance
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Monitor and manage real-time member attendance and participation for this active session.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl ">
            <StatCard title="TOTAL MEMBERS" value="48" icon={Users} color="primary"/>
          </div>
          <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
            <StatCard title="PRESENT" value="32" icon={UserCheck} color="primary" />
          </div>
          <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
            <StatCard title="ABSENT" value="16" icon={UserMinus} color="primary" />
          </div>
          <div className="shadow-[0_8px_30px_rgb(59,130,246,0.1)] rounded-2xl">
            <StatCard title="ATTENDANCE RATE" value="66.7%" icon={Activity} color="primary" />
          </div>
      </div>

      {/* Main Table Container */}
      <div className=" rounded-xl border border-slate-100 shadow-[0_20px_50px_rgba(59,130,246,0.12)] overflow-hidden">
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