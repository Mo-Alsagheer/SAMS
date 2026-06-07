import React, { useState } from 'react'
import { PopupForm } from '../../components/shared/PopupForm'
import { Plus, Layout, GripVertical, Edit3, Trash2, Upload, FileText, X, Eye } from 'lucide-react' // ضفت أيقونة Eye
import { toast } from 'sonner'
import * as z from "zod"
import { Link } from 'react-router-dom' // استيراد Link للنتنقل


const sessionSchema = z.object({
  sessionNumber: z.string().min(1, "Required"),
  title: z.string().min(3, "Title is too short"),
  outline: z.string().optional(),
  sessionFile: z.any().optional(),
});

export default function ManageRoadmap() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);

  
  const roadmapFields = [
    { name: "sessionNumber", label: "Session Number", placeholder: "#", className: "col-span-2 md:col-span-1" },
    { name: "title", label: "Session Title", placeholder: "Topic name...", className: "col-span-2 md:col-span-1" },
    { name: "outline", label: "Outlines", type: "textarea", placeholder: "What's covered?", className: "col-span-2" },
    { name: "sessionFile", label: "Session Resources", type: "custom", className: "col-span-2" },
  ];

  const renderUploadField = (field, watch, setValue) => {
    const fileValue = watch(field.name);
    const selectedFiles = fileValue ? Array.from(fileValue) : [];

    const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setValue(field.name, [...selectedFiles, ...newFiles]);
    };

    const removeFile = (index) => {
      const updatedFiles = selectedFiles.filter((_, i) => i !== index);
      setValue(field.name, updatedFiles.length > 0 ? updatedFiles : null);
    };

    return (
      <div className="space-y-2 md:space-y-3">
        
        <div 
          onClick={() => document.getElementById('roadmap-upload').click()}
          className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/50 transition-all"
        >
          <div className="p-2 md:p-3 bg-white rounded-full shadow-sm mb-2 md:mb-3">
            <Upload className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
            {selectedFiles.length > 0 ? "Add more resources" : "Click to upload resources"}
          </span>
          <input id="roadmap-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 md:max-h-40 overflow-y-auto p-1 custom-scrollbar">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-1">
              <FileText className="text-blue-600 shrink-0" size={12} />
              <span className="text-[10px] md:text-[11px] font-bold text-gray-700 flex-1 truncate">{file.name}</span>
              <button type="button" onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  
  const handleSaveSession = (data) => {
    if (editingSession !== null) {
      const updatedSessions = [...sessions];
      updatedSessions[editingSession] = data;
      setSessions(updatedSessions);
      setEditingSession(null);
      toast.success("Session updated successfully");
    } else {
      setSessions([...sessions, data]);
      toast.success("New session added");
    }
    setIsFormOpen(false);
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8f9fa] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-blue-900 mb-2">Curriculum Roadmap</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium text-pretty">Structure your sessions and manage learning resources.</p>
        </div>
        <button 
          onClick={() => { setEditingSession(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} strokeWidth={3} /> <span className="text-sm md:text-base">Add New Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4 relative">
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-400 rounded-[40px] opacity-40">
            <Layout size={48} className="mb-4 text-blue-900" />
            <h3 className="font-black text-xl text-blue-900">No Sessions Yet</h3>
          </div>
        )}

        {sessions.map((s, index) => (
          <div key={index} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-100 group">
            <div className="flex items-start md:items-center gap-4 md:gap-5 flex-1">
              <div className="mt-1 md:mt-0 p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <GripVertical className="text-gray-300 group-hover:text-blue-400 cursor-grab shrink-0" size={18} md:size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                  <span className="text-[9px] md:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tight">Session {s.sessionNumber}</span>
                  <h3 className="font-bold text-blue-900 text-base md:text-lg leading-none truncate">{s.title}</h3>
                </div>
                
                {s.outline && (
                  <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 line-clamp-2 leading-relaxed">
                    {s.outline}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-400">
                    <FileText size={14} className="text-blue-400" />
                    {s.sessionFile?.length || 0} Resources
                  </span>
                  
                
                  <Link 
                   to={`/director/attendance/${s.sessionNumber}`} 
                    className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50/50 px-2 py-1 rounded-md"
                  >
                    <Eye size={14} />
                    Manage Attendance
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
              <button onClick={() => { setEditingSession(index); setIsFormOpen(true); }} className="p-2 md:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
              <button onClick={() => setSessions(sessions.filter((_, i) => i !== index))} className="p-2 md:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

    
      <PopupForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSession !== null ? "Update Session" : "Create New Session"}
        schema={sessionSchema}
        fields={roadmapFields}
        defaultValues={editingSession !== null ? sessions[editingSession] : { sessionNumber: '', title: '', outline: '', sessionFile: null }}
        onSubmit={handleSaveSession}
        submitLabel="Save"
        
        
        className="max-w-2xl w-[94%] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] md:rounded-[32px]" 
        gridClassName="grid grid-cols-2 gap-3 md:gap-4 overflow-y-auto p-1 pr-2 max-h-full custom-scrollbar" 
        
        bgColor="bg-white"
        titleColor="text-blue-900 font-black text-xl md:text-2xl pt-2"
        labelColor="text-[11px] md:text-sm font-bold text-blue-900/70 mb-1 block"
        
        
        inputClassName="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm text-gray-700 font-medium placeholder:text-gray-300"
        submitClassName='text-base p-5'
          renderCustomField={(field, watch, setValue) => renderUploadField(field, watch, setValue)}
      />
    </div>
  )
}