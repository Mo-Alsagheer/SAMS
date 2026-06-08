import React, { useEffect, useState } from "react";
import { Cloud, Save, ChevronDown, Clock } from "lucide-react";
import Table from "../../components/shared/Table";
import { Button } from "@/components/ui/button"; 
import { toast } from "sonner";

export default function TaskSubmission() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState("42");
  const [grades, setGrades] = useState({}); 

  const tasks = [
    { id: "42", title: "Final Roadmap Review" },
    { id: "43", title: "React State Management" },
    { id: "44", title: "Advanced CSS Layouts" },
  ];

  const mockSubmissions = [
    {
      id: 1,
      name: "Johnathan Doe",
      email: "j.doe@sams-edu.org",
      date: "Oct 21, 2:15 PM",
      file: "final_submission_v2.pdf",
      grade: 8.5, 
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "s.chen@sams-edu.org",
      date: "Oct 22, 11:30 AM",
      file: "Algorithm_Notes.docx",
      grade: 7.0, 
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSubmissions(mockSubmissions);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load submissions.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTask]);

  const handleSaveGrade = (id) => {
    const score = grades[id];
    
    if (score !== undefined && (score > 10 || score < 0)) {
      toast.error("Grade must be between 0 and 10");
      return;
    }
  
    toast.success(`Grade ${score || 'updated'} saved successfully!`);
  };

  const columns = [
    {
      header: "STUDENT NAME",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">{row.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "SUBMISSION DATE",
      accessor: "date",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <Clock size={12} /> {row.date}
        </div>
      ),
    },
    {
      header: "DELIVERABLE",
      render: (row) => (
        <a href="#" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-[11px] font-bold underline">
          <Cloud size={14} /> {row.file}
        </a>
      ),
    },
    {
      header: "SCORE (0-10)",
      render: (row) => {
        const displayGrade = grades[row.id] !== undefined ? grades[row.id] : row.grade;

        return (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="10" 
              step="1" 
              value={grades[row.id] || ""}
              placeholder={row.grade || "0"}
              className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center text-xs font-black text-blue-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setGrades({ ...grades, [row.id]: e.target.value })}
            />
            {displayGrade !== null && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full animate-in fade-in duration-300">
                {displayGrade}/10 
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "ACTIONS",
      render: (row) => (
       
        <Button
          type="button"
          size="sm"
          onClick={() => handleSaveGrade(row.id)}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold transition-all active:scale-95 text-[10px] uppercase tracking-wider rounded-xl px-4 py-2"
        >
          <Save size={12} strokeWidth={2.5} />
          <span>Save Grade</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8dark:bg-transparent min-h-screen font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-400 tracking-tight">Task Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          Review and update student performance scores.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex mb-8">
        <div className="relative w-full md:w-96">
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 rounded-2xl shadow-sm text-sm font-bold text-blue-900 dark:text-slate-100 outline-none focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-500/10 cursor-pointer"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id} className="dark:bg-slate-900">{t.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(59,130,246,0.06)] dark:shadow-none overflow-hidden">
        <Table 
          columns={columns} 
          data={submissions} 
          loading={loading} 
          rowsPerPage={10} 
        />
      </div>
    </div>
  );
}