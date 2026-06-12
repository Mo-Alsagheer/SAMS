import React, { useState, useEffect } from "react";
import { PopupForm } from "../../components/shared/PopupForm";
import { Button } from "@/components/ui/button"; 
import {
  Plus,
  FileText,
  X,
  Upload,
  ClipboardList,
  Trash2,
  Filter,
  ChevronDown,
  ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { 
  getSessionTasks, 
  createTask,
  deleteTask 
} from "@/features/tasks/tasks"; 

import { 
  getSessionsByRoadmap 
} from "@/features/roadmap/roadmap"; 

const taskSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  sessionNumber: z.string().min(1, "Required"),
  deadline: z.string().min(1, "Required"),
  description: z.string().min(5, "Description is too short"),
  taskFile: z.any().optional(),
});

export default function TaskManagement() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbSessions, setDbSessions] = useState([]);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState("all");

  const currentRoadmapId = 1; 

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const sessionsData = await getSessionsByRoadmap(currentRoadmapId);
      setDbSessions(sessionsData || []);

      if (!sessionsData || sessionsData.length === 0) {
        setTasks([]);
        return;
      }

      const allResponses = await Promise.all(
        sessionsData.map(async (session) => {
          try {
            const sId = session.id || session._id;
            const data = await getSessionTasks(sId);
            const tasksArray = Array.isArray(data) ? data : [];
            
            return tasksArray.map(task => ({
              ...task,
              actualSessionId: sId,
              sessionName: session.title || `Session ${session.sessionNumber || sId}`,
             
              sessionNo: String(session.sessionNumber || "")
            }));
          } catch (err) {
            console.warn(`Could not fetch tasks for session`, err);
            return [];
          }
        })
      );

      const combinedTasks = allResponses.flat();

      const formattedTasks = combinedTasks.map((task, index) => {
        const extractedFile = task.fileUrl || task.file_url || task.file || task.material || task.attachment || task.taskFile || null;

        return {
          id: task.id || task._id || `task-fallback-${index}`, 
          title: task.title || "Untitled Task",
          description: task.description || "",
          sessionNumber: task.sessionNo || String(task.sessionId || task.sessionNumber || task.actualSessionId),
          sessionLabel: task.sessionName,
          deadline: task.dueDate ? task.dueDate.split("T")[0] : "",
          taskFile: extractedFile, 
        };
      });

      formattedTasks.sort((a, b) => Number(a.sessionNumber) - Number(b.sessionNumber));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error loading system data:", error);
      toast.error("Failed to sync data with database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (selectedSessionFilter === "all") return true;
    return String(task.sessionNumber) === String(selectedSessionFilter);
  });

  const taskFields = [
    { name: "title", label: "Task Title", placeholder: "Enter task name...", className: "col-span-2" },
    {
      name: "sessionNumber",
      label: "Session Assignment",
      type: "select",
      options: dbSessions.map((session, index) => `Session ${session.sessionNumber || index + 1}`),
      className: "col-span-2 md:col-span-1",
    },
    { name: "deadline", label: "Deadline Date", type: "date", className: "col-span-2 md:col-span-1" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Task instructions...", className: "col-span-2" },
    { name: "taskFile", label: "Material (Optional)", type: "custom", className: "col-span-2" },
  ];

  const handleSaveTask = async (data) => {
    const matchedSession = dbSessions.find(
      (session, index) => `Session ${session.sessionNumber || index + 1}` === data.sessionNumber
    );

    const targetSessionId = matchedSession ? (matchedSession.id || matchedSession._id) : null;

    if (!targetSessionId || isNaN(Number(targetSessionId))) {
      toast.error("Invalid Session selection. Could not resolve Session ID.");
      return;
    }

    try {
      toast.loading("Adding task to tasks list", { id: "task-api-action" });

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      
      const isoDueDate = data.deadline ? new Date(data.deadline).toISOString() : new Date().toISOString();
      formData.append("dueDate", isoDueDate);

      if (data.taskFile && data.taskFile.length > 0) {
        formData.append("file", data.taskFile[0]);
      }

      await createTask(Number(targetSessionId), formData);
      
      toast.success("Task added successfully!", { id: "task-api-action" });
      setIsFormOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(error?.response?.data?.message || "Server Error: Failed to save task", { id: "task-api-action" });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task permanently from server?");
    if (!confirmDelete) return;

    try {
      toast.loading("Deleting task from server...", { id: "task-delete-action" });
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully!", { id: "task-delete-action" });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error?.response?.data?.message || "Server Error: Failed to delete task", { id: "task-delete-action" });
    }
  };

  const renderUploadField = (field, watch, setValue) => {
    const fileValue = watch(field.name);
    const selectedFiles = fileValue ? Array.from(fileValue) : [];

    return (
      <div className="space-y-2">
        <div
          onClick={() => document.getElementById("task-file-input").click()}
          className="group cursor-pointer border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
        >
          <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2">
            <Upload className="text-blue-600 dark:text-blue-400 w-4 h-4" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest text-center">
            {selectedFiles.length > 0 ? "Change attached file" : "Click to upload material"}
          </span>
          <input
            id="task-file-input"
            type="file"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              setValue(field.name, files, { shouldValidate: true });
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
              <FileText className="text-blue-600 dark:text-blue-400 shrink-0" size={12} />
              <span className="text-[10px] font-bold text-gray-700 dark:text-slate-200 flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setValue(field.name, null, { shouldValidate: true })}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={12} strokeWidth={3} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8f9fa] dark:bg-transparent min-h-screen">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-400 mb-2">Task Management</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 font-medium">Viewing all synchronized tasks dynamically mapped by active database sessions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">

          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm min-w-[220px]">
            <Filter size={16} className="text-gray-400 mr-2 shrink-0" />
            <select
              value={selectedSessionFilter}
              onChange={(e) => setSelectedSessionFilter(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 dark:text-slate-200 outline-none w-full cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Active Sessions</option>
              {dbSessions.map((session, index) => {
                const sNumber = String(session.sessionNumber || index + 1);
                return (
                  <option key={session.id || session._id} value={sNumber}>
                    Session {sNumber}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown size={16} strokeWidth={2.5} />
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={() => {
              if (dbSessions.length > 0) {
                setIsFormOpen(true);
              } else {
                toast.error("Please create a session first before creating a task");
              }
            }}
            className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 shrink-0 rounded-xl px-5 py-2.5"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span className="text-sm">Add New Task</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-blue-900 dark:text-blue-400 font-bold text-sm animate-pulse">
          Syncing dashboard with backend database...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-400 dark:border-slate-700 rounded-[40px] opacity-40">
              <ClipboardList size={48} className="mb-4 text-blue-900 dark:text-blue-400" />
              <h3 className="font-black text-xl text-blue-900 dark:text-blue-400 uppercase">No Tasks for this view</h3>
            </div>
          )}

          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col gap-4 transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors shrink-0">
                    <ClipboardList className="text-gray-300 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded uppercase tracking-tight">
                        Session {task.sessionNumber}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-black text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded uppercase italic">Deadline: {task.deadline}</span>
                    </div>
                    <h3 className="font-bold text-blue-900 dark:text-slate-100 text-base md:text-lg leading-tight truncate">{task.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mt-1 mb-3 leading-relaxed">{task.description}</p>
                    
                    {task.taskFile && task.taskFile !== "" ? (
                      <a 
                        href={task.taskFile.startsWith("http") ? task.taskFile : "#"} 
                        target={task.taskFile.startsWith("http") ? "_blank" : "_self"} 
                        rel="noopener noreferrer" 
                        onClick={(e) => {
                          if (!task.taskFile.startsWith("http")) {
                            e.preventDefault();
                            toast.info(`Attached filename: ${task.taskFile} (Requires absolute URL from storage to download)`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100/70 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 w-fit px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50 transition-colors"
                      >
                        <FileText size={14} />
                        <span className="truncate max-w-[200px]">
                          {task.taskFile.startsWith("http") ? "View Attached Material" : task.taskFile}
                        </span>
                        <ExternalLink size={12} className="ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-slate-500 italic">No resources provided</span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl shrink-0 transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PopupForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add New Task"
        schema={taskSchema}
        fields={taskFields}
        defaultValues={{ 
          title: "", 
          sessionNumber: "", 
          deadline: "", 
          description: "", 
          taskFile: null 
        }}
        onSubmit={handleSaveTask}
        submitLabel="Save Task"
        className="max-w-2xl w-[94%] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] md:rounded-[32px]" 
        gridClassName="grid grid-cols-2 gap-3 md:gap-4 overflow-y-auto p-1 pr-2 max-h-full custom-scrollbar" 
        bgColor="bg-white dark:bg-slate-900"
        titleColor="text-blue-900 dark:text-slate-100 font-black text-xl md:text-2xl pt-2"
        labelColor="text-[11px] md:text-sm font-bold text-blue-900/70 dark:text-slate-300 mb-1 block"
        inputClassName="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm text-gray-700 dark:text-slate-200 font-medium placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        submitClassName='text-base p-5'
        renderCustomField={(field, watch, setValue) => renderUploadField(field, watch, setValue)}
      />
    </div>
  );
}