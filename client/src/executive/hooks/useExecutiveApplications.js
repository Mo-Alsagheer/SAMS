import { useEffect, useState } from "react";
import {
  listExecutiveApplications,
  acceptExecutivePhase1,
  rejectExecutivePhase1,
  acceptExecutivePhase2,
  rejectExecutivePhase2,
  scheduleExecutiveInterview,
} from "@/features/applications/executiveApplications";

import { toast } from "sonner";

export function useExecutiveApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await listExecutiveApplications();
      setApplications(data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /* ---------------- Actions ---------------- */

  const runAction = async (id, actionFn) => {
    setActionLoadingId(id);
    try {
      await actionFn(id);
      toast.success("Done");
      fetchApplications();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const acceptPhase1 = (id) => runAction(id, acceptExecutivePhase1);

  const rejectPhase1 = (id) => runAction(id, rejectExecutivePhase1);

  const acceptPhase2 = (id) => runAction(id, acceptExecutivePhase2);

  const rejectPhase2 = (id) => runAction(id, rejectExecutivePhase2);

  /* ---------------- Interview ---------------- */

  const openSchedule = (id) => {
    setSelectedId(id);
    setScheduleModalOpen(true);
  };

  const closeSchedule = () => {
    setSelectedId(null);
    setScheduleModalOpen(false);
  };

  const scheduleInterview = async (data) => {
    try {
      await scheduleExecutiveInterview(selectedId, data);
      toast.success("Interview scheduled");
      closeSchedule();
      fetchApplications();
    } catch {
      toast.error("Failed to schedule interview");
    }
  };

  return {
    applications,
    loading,
    actionLoadingId,

    scheduleModalOpen,
    openSchedule,
    closeSchedule,
    scheduleInterview,

    acceptPhase1,
    rejectPhase1,
    acceptPhase2,
    rejectPhase2,
  };
}
