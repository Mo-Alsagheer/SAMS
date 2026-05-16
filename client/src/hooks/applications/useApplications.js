import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { getCommittees } from "@/features/committee/committee";
import { getCurrentUser } from "@/features/auth/session";

export function useApplications(role, api) {
  const [searchParams, setSearchParams] = useSearchParams();

  const user = getCurrentUser()();
  const isFixedCommittee = role === "director";

  const committeeIdFromUrl = searchParams.get("committeeId") || "";
  const statusFilter = searchParams.get("status") || "";

  /* ---------------- State ---------------- */

  const [committees, setCommittees] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingCommittees, setLoadingCommittees] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [selectedCommittee, setSelectedCommittee] = useState(
    isFixedCommittee ? user?.committeeId || "" : committeeIdFromUrl,
  );

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  /* ---------------- URL sync ---------------- */

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

  /* ---------------- Committees ---------------- */

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

  /* ---------------- Default committee ---------------- */

  useEffect(() => {
    if (isFixedCommittee) return;

    if (committeeIdFromUrl || committees.length === 0) return;

    const first = committees[0]?.id;
    if (!first) return;

    setSelectedCommittee(first);
    updateQueryParams({ committeeId: first });
  }, [committeeIdFromUrl, committees, isFixedCommittee]);

  /* ---------------- Sync URL ---------------- */

  useEffect(() => {
    if (isFixedCommittee) return;

    if (
      committeeIdFromUrl &&
      committeeIdFromUrl !== selectedCommittee
    ) {
      setSelectedCommittee(committeeIdFromUrl);
    }
  }, [committeeIdFromUrl, isFixedCommittee]);

  /* ---------------- Applications ---------------- */

  const loadApplications = useCallback(async () => {
    const committeeId = isFixedCommittee
      ? user?.committeeId
      : selectedCommittee;

    if (!committeeId) return;

    setLoadingApplications(true);
    try {
      const data = await api.list({
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
  }, [selectedCommittee, statusFilter, api, isFixedCommittee, user]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  /* ---------------- Committee select ---------------- */

  const selectCommittee = useCallback(
    (id) => {
      if (isFixedCommittee) return;

      setSelectedCommittee(id);
      updateQueryParams({ committeeId: id });
    },
    [updateQueryParams, isFixedCommittee],
  );

  /* ---------------- Actions wrapper ---------------- */

  const withActionLoading = async (id, action) => {
    setActionLoadingId(id);
    try {
      await action();
      await loadApplications();
    } catch {
      toast.error(
        "The required number of accepted applicants has been reached !",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ---------------- Actions ---------------- */

  const acceptPhase1 = useCallback(
    (id) =>
      withActionLoading(id, async () => {
        await api.acceptPhase1(id);
        toast.success("Phase 1 accepted");
      }),
    [api, loadApplications],
  );

  const rejectPhase1 = useCallback(
    (id) =>
      withActionLoading(id, async () => {
        await api.rejectPhase1(id);
        toast.success("Phase 1 rejected");
      }),
    [api, loadApplications],
  );

  const acceptPhase2 = useCallback(
    (id) =>
      withActionLoading(id, async () => {
        await api.acceptPhase2(id);
        toast.success("Final accepted");
      }),
    [api, loadApplications],
  );

  const rejectPhase2 = useCallback(
    (id) =>
      withActionLoading(id, async () => {
        await api.rejectPhase2(id);
        toast.success("Final rejected");
      }),
    [api, loadApplications],
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
        await api.scheduleInterview(selectedApplicationId, {
          date: new Date(formData.date).toISOString(),
          link: formData.link,
        });

        toast.success("Interview scheduled");
        await loadApplications();
        closeSchedule();
      } catch {
        toast.error("Failed to schedule interview");
      } finally {
        setActionLoadingId(null);
      }
    },
    [selectedApplicationId, api, loadApplications, closeSchedule],
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