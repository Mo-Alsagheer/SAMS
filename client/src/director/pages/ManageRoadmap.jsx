import React, { useState, useEffect } from 'react'
import { PopupForm } from '../../components/shared/PopupForm'
import { Button } from "@/components/ui/button" 
import { Plus, Layout, GripVertical, Edit3, Trash2, Upload, FileText, X, ExternalLink } from 'lucide-react' 
import { toast } from 'sonner'
import * as z from "zod"

import { createSession, updateSession, deleteSession } from '@/features/sessions/sessions'
import { uploadSessionMaterial, getMaterials, deleteMaterial } from '@/features/materials/materials' 
import { getSessionsByRoadmap } from '@/features/roadmap/roadmap'

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
  const [isLoading, setIsLoading] = useState(false);

  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [currentSessionMaterials, setCurrentSessionMaterials] = useState([]);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState("");
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  const currentRoadmapId = 1; 

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const rawSessions = await getSessionsByRoadmap(currentRoadmapId);
      
      if (!rawSessions || rawSessions.length === 0) {
        setSessions([]);
        return;
      }

      const sessionsWithMaterials = await Promise.all(
        rawSessions.map(async (session) => {
          try {
            const materials = await getMaterials(session.id);
            return { ...session, materials: materials || [] };
          } catch (err) {
            console.warn(err);
            return { ...session, materials: session.materials || [] };
          }
        })
      );

      const sortedByCreation = sessionsWithMaterials.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

      const resetedNumbersSessions = sortedByCreation.map((session, index) => ({
        ...session,
        sessionNumber: String(index + 1)
      }));

      setSessions(resetedNumbersSessions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sessions for this roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMaterials = async (session) => {
    setSelectedSessionTitle(session.title);
    setIsMaterialsOpen(true);
    setIsLoadingMaterials(true);
    try {
      const materials = await getMaterials(session.id);
      setCurrentSessionMaterials(materials || []);
    } catch {
      toast.error("Failed to fetch materials for this session");
      setIsMaterialsOpen(false);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const roadmapFields = [
    { name: "sessionNumber", label: "Session Number", placeholder: "#", className: "col-span-2 md:col-span-1" },
    { name: "title", label: "Session Title", placeholder: "Topic name...", className: "col-span-2 md:col-span-1" },
    { name: "outline", label: "Outlines", type: "textarea", placeholder: "What's covered?", className: "col-span-2" },
    { name: "sessionFile", label: "Session Resources", type: "custom", className: "col-span-2" },
  ];

  const renderUploadField = (field, watch, setValue) => {
    const fileValue = watch(field.name) || [];
    const selectedFiles = Array.isArray(fileValue) ? fileValue : Array.from(fileValue);

    const handleFileChange = (e) => {
      if (!e.target.files) return;
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `new-${Date.now()}-${file.name}`,
        name: file.name,
        isNew: true, 
        rawFile: file
      }));
      setValue(field.name, [...selectedFiles, ...newFiles]);
    };

    const removeFile = async (fileItem, index) => {
      if (fileItem.isNew) {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setValue(field.name, updatedFiles);
      } else {
        try {
          await deleteMaterial(fileItem.id);
          toast.success(`Deleted: ${fileItem.name || fileItem.title}`);
          const updatedFiles = selectedFiles.filter((_, i) => i !== index);
          setValue(field.name, updatedFiles);
          await fetchSessions(); 
        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || "Failed to delete server resource");
        }
      }
    };

    return (
      <div className="space-y-2 md:space-y-3">
        <div 
          onClick={() => document.getElementById('roadmap-upload').click()}
          className="group cursor-pointer border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all"
        >
          <div className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2 md:mb-3">
            <Upload className="text-blue-600 dark:text-blue-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-[9px] md:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center">
            {selectedFiles.length > 0 ? "Add more resources" : "Click to upload resources"}
          </span>
          <input id="roadmap-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 md:max-h-40 overflow-y-auto p-1 custom-scrollbar">
          {selectedFiles.map((file, index) => (
            <div key={file.id || index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
              <FileText className={`${file.isNew ? 'text-green-500' : 'text-blue-600 dark:text-blue-400'} shrink-0`} size={12} />
              <span className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-slate-200 flex-1 truncate">
                {file.name || file.title} {file.isNew && <span className="text-[9px] text-green-500 font-normal">(Ready)</span>}
              </span>
              <Button 
                type="button" 
                variant="ghost"
                size="icon-xs"
                onClick={() => removeFile(file, index)} 
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

  const handleSaveSession = async (data) => {
    try {
      setIsLoading(true);

      const sessionPayload = {
        roadmapId: currentRoadmapId,
        sessionNumber: String(data.sessionNumber), 
        title: data.title,
        description: data.outline || "",
        scheduledAt: new Date().toISOString(), 
        isRecorded: false
      };

      let savedSession;
      let targetSessionId;

      if (editingSession !== null) {
        targetSessionId = sessions[editingSession].id;
        savedSession = await updateSession(targetSessionId, sessionPayload);
        toast.success("Session updated successfully");
      } else {
        savedSession = await createSession(sessionPayload);
        targetSessionId = savedSession?.id;
        toast.success("New session added");
      }

      const allFiles = data.sessionFile ? (Array.isArray(data.sessionFile) ? data.sessionFile : Array.from(data.sessionFile)) : [];
      const newFilesToUpload = allFiles.filter(f => f.isNew && f.rawFile);

      if (newFilesToUpload.length > 0 && targetSessionId) {
        toast.info("Uploading resources...");
        
        const fileUploadPromises = newFilesToUpload.map(async (fileItem) => {
          try {
            const formData = new FormData();
            formData.append('title', fileItem.name);
            formData.append('file', fileItem.rawFile); 
            return await uploadSessionMaterial(targetSessionId, formData);
          } catch (fileError) {
            console.error(fileError);
            toast.error(`Failed to upload: ${fileItem.name}`);
            return null;
          }
        });

        await Promise.all(fileUploadPromises);
        toast.success("Resource processing finished");
      }

      setEditingSession(null);
      setIsFormOpen(false);
      await fetchSessions(); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred while saving data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (index) => {
    const sessionId = sessions[index].id;
    if (!sessionId) return;

    try {
      await deleteSession(sessionId);
      toast.success("Session deleted successfully");
      setSessions(prev => prev.filter((_, i) => i !== index));
      fetchSessions(); 
    } catch {
      toast.error("Failed to delete session");
    }
  };

  return (
    <div className="p-4 md:p-10 dark:bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-400 mb-2">Curriculum Roadmap</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 font-medium">Structure your sessions and manage learning resources.</p>
        </div>
        
        <Button 
          type="button"
          size="lg"
          onClick={() => { setEditingSession(null); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 shrink-0 rounded-xl px-5 py-2.5"
        >
          <Plus size={16} strokeWidth={3} /> 
          <span className="text-sm">Add New Session</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 relative">
        {isLoading && sessions.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-slate-500 font-medium animate-pulse">Loading roadmap sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-400 dark:border-slate-700 rounded-[40px] opacity-40">
            <Layout size={48} className="mb-4 text-blue-900 dark:text-blue-400" />
            <h3 className="font-black text-xl text-blue-900 dark:text-blue-400">No Sessions Yet</h3>
          </div>
        ) : (
          sessions.map((s, index) => (
            <div key={`session-item-${index}`} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 group">
              <div className="flex items-start md:items-center gap-4 md:gap-5 flex-1">
                <div className="mt-1 md:mt-0 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors">
                  <GripVertical className="text-gray-300 dark:text-slate-500 group-hover:text-blue-400 dark:group-hover:text-blue-300 cursor-grab shrink-0" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                    <span className="text-[9px] md:text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded uppercase tracking-tight">
                      Session {s.sessionNumber}
                    </span>
                    <h3 className="font-bold text-blue-900 dark:text-slate-100 text-base md:text-lg leading-none truncate">{s.title}</h3>
                  </div>
                  
                  {s.description && (
                    <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 mb-2 md:mb-3 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => handleViewMaterials(s)}
                      className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <FileText size={14} className="text-blue-400" />
                      {s.materials?.length || 0} Resources
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-1 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-slate-800">
                <Button 
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => { setEditingSession(index); setIsFormOpen(true); }} 
                  className="text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <Edit3 size={16} />
                </Button>
                <Button 
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDeleteSession(index)} 
                  className="text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <PopupForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSession !== null ? "Update Session" : "Create New Session"}
        schema={sessionSchema}
        fields={roadmapFields}
        defaultValues={editingSession !== null ? {
          sessionNumber: String(sessions[editingSession].sessionNumber),
          title: sessions[editingSession].title,
          outline: sessions[editingSession].description,
          sessionFile: sessions[editingSession].materials || []
        } : { sessionNumber: String(sessions.length + 1), title: '', outline: '', sessionFile: [] }} 
        onSubmit={handleSaveSession}
        submitLabel="Save"
        className="max-w-2xl w-[94%] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] md:rounded-[32px]" 
        gridClassName="grid grid-cols-2 gap-3 md:gap-4 overflow-y-auto p-1 pr-2 max-h-full custom-scrollbar" 
        bgColor="bg-white dark:bg-slate-900"
        titleColor="text-blue-900 dark:text-slate-100 font-black text-xl md:text-2xl pt-2"
        labelColor="text-[11px] md:text-sm font-bold text-blue-900/70 dark:text-slate-300 mb-1 block"
        inputClassName="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm text-gray-700 dark:text-slate-200 font-medium placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        submitClassName='text-base p-5'
        renderCustomField={(field, watch, setValue) => renderUploadField(field, watch, setValue)}
      />

      {isMaterialsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-[94%] max-w-md p-6 rounded-[24px] shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-lg text-blue-900 dark:text-slate-100">Session Resources</h3>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 truncate max-w-[250px]">{selectedSessionTitle}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon-xs" 
                onClick={() => setIsMaterialsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X size={16} strokeWidth={2.5} />
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {isLoadingMaterials ? (
                <div className="text-center py-6 text-sm text-gray-400">Loading resources...</div>
              ) : currentSessionMaterials.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400 dark:text-slate-500">
                  No uploaded resources for this session.
                </div>
              ) : (
                currentSessionMaterials.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="text-blue-500 shrink-0" size={16} />
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate max-w-[200px]">
                        {mat.title || mat.name}
                      </span>
                    </div>
                    {mat.fileUrl && (
                      <a 
                        href={mat.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}