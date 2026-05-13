import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { getCommittees } from "@/features/committee/committee";
import {
  listDirectorApplications,
  acceptDirectorPhase1,
  rejectDirectorPhase1,
  scheduleDirectorInterview,
  acceptDirectorPhase2,
  rejectDirectorPhase2,
} from "@/features/applications/directorApplications";

export function useDirectorApplications() {
  const [searchParams, setSearchParams] = useSearchParams();

  const committeeIdFromUrl = searchParams.get("committeeId") || "";
  const statusFilter = searchParams.get("status") || "";

  /* ---------------- State ---------------- */

  const [committees, setCommittees] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [selectedCommittee, setSelectedCommittee] =
    useState(committeeIdFromUrl);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  /* ---------------- Helpers ---------------- */

  const updateQueryParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) next.delete(key);
        else next.set(key, String(value));
      });

      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  /* ---------------- Load Committees ---------------- */

  useEffect(() => {
    const fetchCommittees = async () => {
      setLoadingCommittees(true);
      try {
        const data = await getCommittees();
        setCommittees(data || []);
      } catch {
        toast.error("Failed to load committees");
      } finally {
        setLoadingCommittees(false);
      }
    };

    fetchCommittees();
  }, []);

  /* ---------------- Default Committee ---------------- */

  useEffect(() => {
    if (committeeIdFromUrl || committees.length === 0) return;

    const first = committees[0]?.id;
    if (!first) return;

    setSelectedCommittee(first);
    updateQueryParams({ committeeId: first });
  }, [committeeIdFromUrl, committees, updateQueryParams]);

  /* ---------------- Sync URL → state ---------------- */

  useEffect(() => {
    if (committeeIdFromUrl && committeeIdFromUrl !== selectedCommittee) {
      setSelectedCommittee(committeeIdFromUrl);
    }
  }, [committeeIdFromUrl]);

  /* ---------------- Load Applications ---------------- */

 const loadApplications = useCallback(
  async (committeeId) => {
    if (!committeeId) return;

    setLoadingApplications(true);

    try {
      const data = await listDirectorApplications({
        committeeId,
        status: statusFilter,
      });

      setApplications(data || []);
    } catch {
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  },
  [statusFilter],
);

  useEffect(() => {
    if (!selectedCommittee) return;
    loadApplications(selectedCommittee);
  }, [selectedCommittee, loadApplications]);

  /* ---------------- Committee Selection ---------------- */

  const selectCommittee = useCallback(
    (id) => {
      setSelectedCommittee(id);
      updateQueryParams({ committeeId: id });
    },
    [updateQueryParams],
  );

  /* ---------------- Actions ---------------- */

  const withActionLoading = async (id, action) => {
    setActionLoadingId(id);
    try {
      await action();
      await loadApplications(selectedCommittee);
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const acceptPhase1 = useCallback(
    (id) =>
      withActionLoading(id, () =>
        acceptDirectorPhase1(id).then(() => toast.success("Phase 1 accepted")),
      ),
    [selectedCommittee, loadApplications],
  );

  const rejectPhase1 = useCallback(
    (id) =>
      withActionLoading(id, () =>
        rejectDirectorPhase1(id).then(() => toast.success("Phase 1 rejected")),
      ),
    [selectedCommittee, loadApplications],
  );

  const acceptPhase2 = useCallback(
    (id) =>
      withActionLoading(id, () =>
        acceptDirectorPhase2(id).then(() => toast.success("Final accepted")),
      ),
    [selectedCommittee, loadApplications],
  );

  const rejectPhase2 = useCallback(
    (id) =>
      withActionLoading(id, () =>
        rejectDirectorPhase2(id).then(() => toast.success("Final rejected")),
      ),
    [selectedCommittee, loadApplications],
  );

  /* ---------------- Schedule ---------------- */

  const openSchedule = useCallback((id) => {
    setSelectedApplicationId(id);
    setScheduleModalOpen(true);
  }, []);

  const closeSchedule = useCallback(() => {
    setScheduleModalOpen(false);
    setSelectedApplicationId(null);
  }, []);

  const scheduleInterview = useCallback(
    async (formData) => {
      if (!selectedApplicationId) return;

      setActionLoadingId(selectedApplicationId);

      try {
        await scheduleDirectorInterview(selectedApplicationId, {
          date: new Date(formData.date).toISOString(),
          link: formData.link,
        });

        toast.success("Interview scheduled");
        await loadApplications(selectedCommittee);

        closeSchedule();
      } catch {
        toast.error("Failed to schedule interview");
      } finally {
        setActionLoadingId(null);
      }
    },
    [selectedApplicationId, selectedCommittee, loadApplications, closeSchedule],
  );

  /* ---------------- Return ---------------- */

  return {
    committees,
    applications,

    selectedCommittee,
    selectCommittee,

    loadingCommittees,
    loadingApplications,

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
