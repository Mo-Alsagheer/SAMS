"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Video, MapPin, Clock, Plus, Eye, Loader2 } from "lucide-react";
import { PopupForm } from "../../components/shared/PopupForm";
import { toast } from "sonner";
import * as z from "zod";
import { Link } from "react-router-dom";
import {
  createSessionMeeting,
  getMyMeetings,
} from "@/features/meetings/meetings";
import { getSessionsByRoadmap } from "@/features/roadmap/roadmap";

const meetingSchema = z.object({
  sessionId: z.string().min(1, "Please select a session"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  meetingType: z.string().min(1, "Select meeting type"),
});

export default function Schedule() {
  const { roadmapId: urlRoadmapId } = useParams();

  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      const currentRoadmapId = urlRoadmapId || 1;
      try {
        setLoadingSessions(true);
        const res = await getSessionsByRoadmap(currentRoadmapId);
        setSessions(Array.isArray(res) ? res : res?.data || []);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load sessions.";
        toast.error(message);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [urlRoadmapId]);

  useEffect(() => {
    const fetchMyMeetings = async () => {
      try {
        setLoadingMeetings(true);
        const res = await getMyMeetings();
        setMeetings(Array.isArray(res) ? res : res?.data || []);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load meetings.";
        toast.error(message);
      } finally {
        setLoadingMeetings(false);
      }
    };
    fetchMyMeetings();
  }, []);

  const handleSchedule = async (data) => {
    try {
      setCreatingMeeting(true);

      const selectedSession = sessions.find((s) => {
        const sessionLabel = s.sessionNumber 
          ? `Session ${s.sessionNumber}${s.title ? `: ${s.title}` : ""}`
          : s.title || `Session ${s.id}`;
        return sessionLabel === data.sessionId;
      });

      const sessionId = selectedSession ? selectedSession.id : data.sessionId;

      const scheduledAt = new Date(
        `${data.date}T${data.time}:00`,
      ).toISOString();

      const meetingData = {
        title: selectedSession ? selectedSession.title : "New Meeting",
        scheduledAt,
        meetingType: data.meetingType,
      };

      await createSessionMeeting(sessionId, meetingData);
      toast.success(`Meeting scheduled for ${data.date}`);

      const res = await getMyMeetings();
      setMeetings(Array.isArray(res) ? res : res?.data || []);
      setShowForm(false);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create meeting.";
      toast.error(message);
    } finally {
      setCreatingMeeting(false);
    }
  };

  const sessionOptions = sessions.map((s) => {
    const label = s.sessionNumber 
      ? `Session ${s.sessionNumber}${s.title ? `: ${s.title}` : ""}`
      : s.title || `Session ${s.id}`;
      
    return {
      label: label,
      value: String(s.id),
    };
  });

  const schedulingFields = [
    {
      name: "sessionId",
      label: "SESSION NUMBER",
      type: "select",
      options: loadingSessions
        ? ["Loading sessions..."]
        : sessionOptions.map((o) => o.label),
      className: "col-span-2",
    },
    { name: "date", label: "DATE", type: "date", className: "col-span-1" },
    { name: "time", label: "TIME", type: "time", className: "col-span-1" },
    {
      name: "meetingType",
      label: "MEETING TYPE",
      type: "select",
      options: ["online", "offline"],
      className: "col-span-2",
    },
  ];

  const formDefaultValues = useMemo(
    () => ({ date: date ? date.toISOString().split("T")[0] : "" }),
    [date],
  );

  const modifiers = {
    booked: (day) =>
      meetings.some(
        (m) => new Date(m.scheduledAt).toDateString() === day.toDateString(),
      ),
  };

  const modifiersStyles = {
    booked: {
      fontWeight: "bold",
      backgroundColor: "#e0e7ff",
      color: "#4f46e5",
      borderRadius: "50%",
    },
  };

  const todayMeetings = meetings.filter(
    (m) => new Date(m.scheduledAt).toDateString() === date.toDateString(),
  );

  return (
    <div className="p-4 md:p-10 dark:bg-transparent min-h-screen font-sans">
      <div className="mb-8 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-900 dark:text-blue-400 tracking-tight">
            Schedule Meetings
          </h1>
          <p className="text-gray-400 dark:text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
            Manage Curriculum Timeline
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          onClick={() => setShowForm(true)}
          disabled={loadingSessions}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 shrink-0 rounded-xl px-5 py-2.5"
        >
          <Plus size={16} strokeWidth={3} />
          <span className="text-sm">Add Schedule</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="w-full text-slate-900 dark:text-slate-100"
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-blue-900/5 dark:bg-slate-900 p-6 rounded-[40px] border border-blue-100/50 dark:border-slate-800 min-h-[300px]">
            <h3 className="text-blue-900 dark:text-blue-400 font-black text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <Clock size={16} /> Agenda
            </h3>

            {loadingMeetings ? (
              <div className="flex justify-center items-center py-10 gap-2 text-xs font-bold text-slate-400">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                Loading meetings...
              </div>
            ) : (
              <div className="space-y-3">
                {todayMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-white dark:border-slate-700 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 rounded-xl shrink-0">
                        {m.meetingType === "online" ? (
                          <Video size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-blue-900 dark:text-slate-100 text-base truncate">
                          {m.title}
                        </h4>
                        <p className="text-[13px] text-gray-400 dark:text-slate-400 flex items-center gap-2">
                          {new Date(m.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {m.meetingType && (
                            <span
                              className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider ${
                                m.meetingType === "online"
                                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400"
                                  : "bg-orange-50 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400"
                              }`}
                            >
                              {m.meetingType}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/director/attendance/${m.id}`}
                      className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50/50 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-md shrink-0 ml-2"
                    >
                      <Eye size={14} />
                      Manage Attendance
                    </Link>
                  </div>
                ))}

                {todayMeetings.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                      No meetings for this day
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <PopupForm
          key={`form-${date.getTime()}`}
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Meeting"
          schema={meetingSchema}
          fields={schedulingFields}
          defaultValues={formDefaultValues}
          onSubmit={handleSchedule}
          submitLabel={creatingMeeting ? "Scheduling..." : "Confirm Schedule"}
          className="max-w-2xl w-[94%] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] md:rounded-[32px]"
          gridClassName="grid grid-cols-2 gap-3 md:gap-4 overflow-y-auto p-1 pr-2 max-h-full custom-scrollbar"
          bgColor="bg-white dark:bg-slate-900"
          titleColor="text-blue-900 dark:text-slate-100 font-black text-xl md:text-2xl pt-2"
          labelColor="text-[11px] md:text-sm font-bold text-blue-900/70 dark:text-slate-300 mb-1 block"
          inputClassName="w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm text-gray-700 dark:text-slate-200 font-medium placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
          submitClassName="text-base p-5"
        />
      )}
    </div>
  );
}