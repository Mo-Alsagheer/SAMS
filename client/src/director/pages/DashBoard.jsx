import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCommitteeStatistics } from "@/features/member/member"; 
import StatCard from "../../components/shared/StatCard"; 

import { 
  Users, 
  CheckCircle, 
  Calendar, 
  Award, 
  UserCheck, 
  UserMinus, 
  UserX,
  Activity,
  TrendingUp
} from "lucide-react";

function DashBoard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const statisticsData = await getCommitteeStatistics();
        setStats(statisticsData);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col justify-center items-center py-40 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-8 space-y-8 animate-fadeIn">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="text-blue-600" size={24} />
            Performance Dashboard
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
            Real-time analytics breakdown and active metrics monitoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0} 
          icon={Users}
          color="primary"
          
        />
        <StatCard
          title="Active Members"
          value={stats?.byStatus?.active || 0}
          icon={CheckCircle}
          color="success"
          
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendance?.averageAttendanceRate || 0}%`}
          icon={Calendar}
          color="warning"
        />
        <StatCard
          title="Task Submission"
          value={`${stats?.tasks?.submissionRate || 0}%`}
          icon={Award}
          color="secondary"
          />
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
       
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Members Status</h3>
              <p className="text-[11px] text-slate-400">Roster classification based on active administration data</p>
            </div>
            
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/60 dark:border-emerald-900/20 transition-all hover:bg-emerald-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <UserCheck size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Members</span>
                </div>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1 rounded-lg">
                  {stats.byStatus?.active || 0} Members
                </span>
              </div>

             
              <div className="flex items-center justify-between p-3.5 bg-amber-50/40 dark:bg-amber-950/10 rounded-xl border border-amber-100/60 dark:border-amber-900/20 transition-all hover:bg-amber-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                    <UserMinus size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">On Hold</span>
                </div>
                <span className="text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-lg">
                  {stats.byStatus?.hold || 0} Members
                </span>
              </div>

           
              <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/10 rounded-xl border border-rose-100/60 dark:border-rose-900/20 transition-all hover:bg-rose-50/70">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                    <UserX size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fired / Dismissed</span>
                </div>
                <span className="text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 px-3 py-1 rounded-lg">
                  {stats.byStatus?.fired || 0} Members
                </span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Performance Ratios</h3>
                <p className="text-[11px] text-slate-400">Visual progress of activities and engagement rates</p>
              </div>
              <TrendingUp size={16} className="text-blue-500" />
            </div>

            <div className="space-y-6">
           
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Attendance Rate</span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                    {stats.attendance?.averageAttendanceRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.attendance?.averageAttendanceRate || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Present: {stats.attendance?.totalPresent || 0}</span>
                  <span>Absent: {stats.attendance?.totalAbsent || 0}</span>
                </div>
              </div>

             
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Task Submission Rate</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    {stats.tasks?.submissionRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.tasks?.submissionRate || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Assigned: {stats.tasks?.totalAssignedTasks || 0}</span>
                  <span>Submissions: {stats.tasks?.totalSubmissions || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default DashBoard;