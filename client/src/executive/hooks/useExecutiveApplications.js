import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { getCommittees } from "@/features/committee/committee";
import {
  acceptExecutiveApplicationPhase1,
  acceptExecutiveApplicationPhase2,
  getExecutiveApplications,
  rejectExecutiveApplicationPhase1,
  rejectExecutiveApplicationPhase2,
  scheduleExecutiveApplicationInterview,
} from "@/features/applications/applications";

export function useExecutiveApplications() {
  const [searchParams, setSearchParams] = useSearchParams();

  const committeeIdFromUrl = searchParams.get("committeeId") || "";
  const statusFilter = searchParams.get("status");

  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] =
    useState(committeeIdFromUrl);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const updateQueryParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  // Keep local state in sync with browser navigation (back/forward)
  useEffect(() => {
    if (committeeIdFromUrl && committeeIdFromUrl !== selectedCommittee) {
      setSelectedCommittee(committeeIdFromUrl);
    }
  }, [committeeIdFromUrl, selectedCommittee]);

  // Load committees once
  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const data = await getCommittees();
        setCommittees(data || []);
      } catch {
        toast.error("Failed to load committees");
      }
    };

    loadCommittees();
  }, []);

  // If no committeeId is present in the URL, default to the first committee
  useEffect(() => {
    if (committeeIdFromUrl || committees.length === 0) return;

    const firstId = committees[0]?.id;
    if (!firstId) return;

    setSelectedCommittee(firstId);
    updateQueryParams({ committeeId: firstId });
  }, [committeeIdFromUrl, committees, updateQueryParams]);

  const loadApplications = useCallback(
    async (committeeId) => {
      if (!committeeId) return;

      setLoading(true);
      try {
        const data = await getExecutiveApplications(committeeId, statusFilter);
        setApplications(data || []);
      } catch {
        toast.error("Failed to load applications");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    if (!selectedCommittee) return;
    loadApplications(selectedCommittee);
  }, [selectedCommittee, loadApplications]);

  const selectCommittee = useCallback(
    (committeeId) => {
      setSelectedCommittee(committeeId);
      updateQueryParams({ committeeId });
    },
    [updateQueryParams],
  );

  const acceptPhase1 = useCallback(
    async (applicationId) => {
      setActionLoadingId(applicationId);
      try {
        await acceptExecutiveApplicationPhase1(applicationId);
        toast.success("Phase 1 accepted");
        await loadApplications(selectedCommittee);
      } catch {
        toast.error("Action failed");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications, selectedCommittee],
  );

  const rejectPhase1 = useCallback(
    async (applicationId) => {
      setActionLoadingId(applicationId);
      try {
        await rejectExecutiveApplicationPhase1(applicationId);
        toast.success("Phase 1 rejected");
        await loadApplications(selectedCommittee);
      } catch {
        toast.error("Action failed");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications, selectedCommittee],
  );

  const acceptPhase2 = useCallback(
    async (applicationId) => {
      setActionLoadingId(applicationId);
      try {
        await acceptExecutiveApplicationPhase2(applicationId);
        toast.success("Final accepted");
        await loadApplications(selectedCommittee);
      } catch {
        toast.error("Action failed");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications, selectedCommittee],
  );

  const rejectPhase2 = useCallback(
    async (applicationId) => {
      setActionLoadingId(applicationId);
      try {
        await rejectExecutiveApplicationPhase2(applicationId);
        toast.success("Final rejected");
        await loadApplications(selectedCommittee);
      } catch {
        toast.error("Action failed");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications, selectedCommittee],
  );

  const openSchedule = useCallback((applicationId) => {
    setSelectedAppId(applicationId);
    setScheduleOpen(true);
  }, []);

  const closeSchedule = useCallback(() => {
    setScheduleOpen(false);
    setSelectedAppId(null);
  }, []);

  const scheduleInterview = useCallback(
    async (formData) => {
      if (!selectedAppId) return;

      setActionLoadingId(selectedAppId);
      try {
        await scheduleExecutiveApplicationInterview(selectedAppId, {
          date: new Date(formData.date).toISOString(),
          link: formData.link,
        });

        toast.success("Interview scheduled");
        await loadApplications(selectedCommittee);
      } catch {
        toast.error("Failed to schedule interview");
      } finally {
        setActionLoadingId(null);
      }
    },
    [loadApplications, selectedAppId, selectedCommittee],
  );

  return {
    committees,
    selectedCommittee,
    applications,
    loading,
    actionLoadingId,

    scheduleOpen,
    openSchedule,
    closeSchedule,
    scheduleInterview,

    selectCommittee,
    acceptPhase1,
    rejectPhase1,
    acceptPhase2,
    rejectPhase2,
  };
}
