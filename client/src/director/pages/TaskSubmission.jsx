import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // عشان لو الـ roadmapId في الـ URL
import { Cloud, Save, Clock, ChevronDown, ChevronUp, Folder, BookOpen, Layers, Loader2 } from "lucide-react";
import Table from "../../components/shared/Table";
import { Button } from "@/components/ui/button"; 
import { toast } from "sonner";

// استيراد كافة الدوال من الـ API 
import { getSessionTasks, getTaskSubmissions, updateSubmissionScore } from "@/features/submission/submission";
import { getSessionsByRoadmap } from "@/features/roadmap/roadmap";

export default function TaskSubmission() {
  const { roadmapId: urlRoadmapId } = useParams(); // 1. محاولة قراءة الـ ID من الـ URL direct
  
  const [sessions, setSessions] = useState([]); 
  const [submissions, setSubmissions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [grades, setGrades] = useState({}); 
  
  const [sessionTasksData, setSessionTasksData] = useState({});
  const [expandedSession, setExpandedSession] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // 2. جلب السيشنز بناءً على الـ Roadmap ID ديناميكياً
  useEffect(() => {
    const fetchInitialSessions = async () => {
      const currentRoadmapId = urlRoadmapId || 1; 

      try {
        setLoadingSessions(true);
        const res = await getSessionsByRoadmap(currentRoadmapId);
        setSessions(Array.isArray(res) ? res : (res?.data || []));
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load sessions for this roadmap.";
        toast.error(message);
      } finally {
        setLoadingSessions(false);
      }
    };
    
    fetchInitialSessions();
  }, [urlRoadmapId]);

  // 3. جلب التاسكات فور فتح كارت السيشن
  const handleSessionToggle = async (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);

    if (!sessionTasksData[sessionId]) {
      try {
        setLoadingTasks(true);
        const tasks = await getSessionTasks(sessionId);
        setSessionTasksData(prev => ({
          ...prev,
          [sessionId]: Array.isArray(tasks) ? tasks : (tasks?.data || [])
        }));
      } catch (taskError) { 
        const message = taskError?.response?.data?.message || "Failed to load tasks.";
        toast.error(message);
      } finally {
        setLoadingTasks(false);
      }
    }
  };

  // 4. جلب تسليمات الطلاب عند تغيير الـ Task المختارة (تأكدي من تعديل الدالة في ملف الـ API لإضافة كلمة director)
  useEffect(() => {
    if (!selectedTask) return;

    const fetchSubmissionsData = async () => {
      try {
        setLoadingSubmissions(true);
        const res = await getTaskSubmissions(selectedTask);
        setSubmissions(Array.isArray(res) ? res : (res?.data || []));
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load submissions.";
        toast.error(message);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissionsData();
  }, [selectedTask]);

  const handleTaskSelect = (taskId) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  // 5. حفظ الدرجة للباك إند (تمت العودة للتقييم من 0 لـ 10)
  const handleSaveGrade = async (submissionId) => {
    const score = grades[submissionId];
    
    if (score === undefined || score === "") {
      toast.error("Please enter a score first");
      return;
    }

    if (Number(score) > 10 || Number(score) < 0) {
      toast.error("Score must be between 0 and 10");
      return;
    }

    try {
      await updateSubmissionScore(submissionId, score);
      toast.success(`Score (${score}/10) saved successfully!`);
      
      setSubmissions(prev => prev.map(sub => sub.id === submissionId ? { ...sub, score: Number(score) } : sub));
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to save score";
      toast.error(msg);
    }
  };

  const columns = [
    {
      header: "STUDENT NAME",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
            {row.name ? row.name.charAt(0) : "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">{row.name || "Unknown Student"}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{row.email || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "SUBMISSION DATE",
      accessor: "date",
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
          <Clock size={12} /> {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "N/A"}
        </div>
      ),
    },
    {
      header: "DELIVERABLE",
      render: (row) => (
        <a 
          href={row.fileUrl || "#"} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors text-[11px] font-bold underline"
        >
          <Cloud size={14} /> {row.fileUrl ? "View Attached File" : "No file"}
        </a>
      ),
    },
    {
      header: "SCORE (0-10)", // تم التحديث إلى 10
      render: (row) => {
        const currentScore = grades[row.id] !== undefined ? grades[row.id] : (row.score !== undefined ? row.score : row.grade);
        return (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="10" 
              step="1" 
              value={grades[row.id] || ""}
              placeholder={row.score !== null && row.score !== undefined ? row.score : "0"}
              className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center text-xs font-black text-blue-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setGrades({ ...grades, [row.id]: e.target.value })}
            />
            {currentScore !== null && currentScore !== undefined && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                {currentScore}/10 
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
    <div className="p-4 md:p-8 min-h-screen font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-400 tracking-tight">Task Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
          Select a session and task to review and grade student submittals (Scale 0-10).
        </p>
      </div>

      {/* شاشة تحميل السيشنز */}
      {loadingSessions ? (
        <div className="flex justify-center items-center py-12 gap-2 text-sm font-bold text-slate-400">
          <Loader2 size={20} className="animate-spin text-blue-500" /> Loading Roadmap Sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-sm font-medium text-slate-400 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
          No sessions found for this roadmap.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isSessionOpen = expandedSession === session.id;
            const tasksList = sessionTasksData[session.id] || [];

            return (
              <div 
                key={session.id} 
                className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_4px_20px_rgba(59,130,246,0.03)] overflow-hidden transition-all duration-300"
              >
                {/* Session Header Card */}
                <div 
                  onClick={() => handleSessionToggle(session.id)}
                  className={`p-5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isSessionOpen ? "bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-blue-900 dark:text-slate-100">{session.title || `Session ${session.id}`}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Click to view assigned tasks</p>
                    </div>
                  </div>
                  {isSessionOpen ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                </div>

                {/* Tasks Dropdown Menu */}
                {isSessionOpen && (
                  <div className="p-4 bg-white dark:bg-slate-900/60 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {loadingTasks ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 p-2">
                        <Loader2 size={14} className="animate-spin text-blue-500" /> Loading tasks...
                      </div>
                    ) : tasksList.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2">No tasks assigned to this session.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {tasksList.map((task) => {
                          const isTaskActive = selectedTask === task.id;
                          return (
                            <div
                              key={task.id}
                              onClick={() => handleTaskSelect(task.id)}
                              className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                                isTaskActive 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_25px_rgba(59,130,246,0.25)] scale-[0.99]" 
                                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <Folder size={16} className={isTaskActive ? "text-blue-200" : "text-slate-400"} />
                                <span className="text-xs font-bold truncate">{task.title}</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shrink-0 ${
                                isTaskActive ? "bg-white/20 text-white" : "bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-blue-600 dark:text-blue-400"
                              }`}>
                                ID: {task.id}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* الـ Table Section الخاص بالتاسك المختارة */}
                    {tasksList.some(t => t.id === selectedTask) && selectedTask && (
                      <div className="mt-6 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
                        <div className="bg-slate-50/60 dark:bg-slate-800/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                          <Layers size={14} className="text-blue-500" />
                          <span className="text-xs font-black text-blue-900 dark:text-slate-300 uppercase tracking-wider">
                            Submissions Dashboard
                          </span>
                        </div>
                        <Table 
                          columns={columns} 
                          data={submissions} 
                          loading={loadingSubmissions} 
                          rowsPerPage={5} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}