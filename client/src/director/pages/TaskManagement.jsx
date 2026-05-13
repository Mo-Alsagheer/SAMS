import React, { useState } from "react";
import { PopupForm } from "../../components/shared/PopupForm";
import {
  Plus,
  Edit3,
  Trash2,
  Upload,
  FileText,
  X,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";


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
  const [editingTask, setEditingTask] = useState(null);


  const taskFields = [
    {
      name: "title",
      label: "Task Title",
      placeholder: "Enter task name...",
      className: "col-span-2",
    },
    {
      name: "sessionNumber",
      label: "Session Number",
      type: "select",
      options: ["1", "2", "3", "4", "5"], 
      className: "col-span-2 md:col-span-1",
    },
    {
      name: "deadline",
      label: "Deadline Date",
      type: "date",
      className: "col-span-2 md:col-span-1",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Task instructions...",
      className: "col-span-2",
    },
    {
      name: "taskFile",
      label: "Material",
      type: "custom",
      className: "col-span-2",
    },
  ];

 
  const renderUploadField = (field, watch, setValue) => {
    const fileValue = watch(field.name);
    const selectedFiles = fileValue ? Array.from(fileValue) : [];

    return (
      <div className="space-y-2">
        <div
          onClick={() => document.getElementById("task-file-input").click()}
          className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 md:p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/50 transition-all"
        >
          <div className="p-2 bg-white rounded-full shadow-sm mb-2">
            <Upload className="text-blue-600 w-5 h-5" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
            {selectedFiles.length > 0 ? "Add more materials" : "Click to upload material"}
          </span>
          <input
            id="task-file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              setValue(field.name, [...selectedFiles, ...Array.from(e.target.files)])
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
              <FileText className="text-blue-600 shrink-0" size={12} />
              <span className="text-[10px] font-bold text-gray-700 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setValue(field.name, selectedFiles.filter((_, i) => i !== index))}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };


  const handleSaveTask = (data) => {
    if (editingTask !== null) {
      const updated = [...tasks];
      updated[editingTask] = data;
      setTasks(updated);
      setEditingTask(null);
      toast.success("Task updated successfully");
    } else {
      setTasks([...tasks, data]);
      toast.success("New task created");
    }
    setIsFormOpen(false);
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8f9fa] min-h-screen">
    
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-blue-900 mb-2">Task Management</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Assign tasks and set deadlines for your team members.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} strokeWidth={3} /> <span className="text-sm md:text-base">Add New Task</span>
        </button>
      </div>

    
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-400 rounded-[40px] opacity-40">
            <ClipboardList size={48} className="mb-4 text-blue-900" />
            <h3 className="font-black text-xl text-blue-900 uppercase">No Tasks Yet</h3>
          </div>
        )}

        {tasks.map((task, index) => (
          <div key={index} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-4 flex-1">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <ClipboardList className="text-gray-300 group-hover:text-blue-500 shrink-0" size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Session {task.sessionNumber}</span>
                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase italic">Deadline: {task.deadline}</span>
                  </div>
                  <h3 className="font-bold text-blue-900 text-base md:text-lg leading-tight truncate">{task.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                <button onClick={() => { setEditingTask(index); setIsFormOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Edit3 size={18} /></button>
                <button onClick={() => setTasks(tasks.filter((_, i) => i !== index))} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>

       
            {task.taskFile && Array.from(task.taskFile).length > 0 && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full">
                   <FileText className="text-blue-600" size={12} />
                   <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                     {Array.from(task.taskFile).length} Materials
                   </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <PopupForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTask !== null ? "Update Task" : "Add New Task"}
        schema={taskSchema}
        fields={taskFields}
        defaultValues={
          editingTask !== null ? tasks[editingTask] : { title: "", sessionNumber: "", deadline: "", description: "", taskFile: null }
        }
        onSubmit={handleSaveTask}
        submitLabel="Save Task"
        titleColor="text-blue-900 font-black text-2xl pt-2"
        labelColor="text-sm font-bold text-blue-900/70 mb-1 block"
        renderCustomField={(field, watch, setValue) => renderUploadField(field, watch, setValue)}
      />
    </div>
  );
}