import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCommittee,
  getCommitteeDirectors,
  getCommitteeMembers,
} from "@/features/committee/committee";
import { toast } from "sonner";
import Table from "@/components/shared/Table";
import { getInitials } from "@/utils/getInitials";
import { ArrowLeft } from "lucide-react";
import TabButton from "../components/TabButton";
import InfoCard from "../components/InfoCard";
import { Skeleton } from "@/components/ui/skeleton";

function CommitteeDetails() {
  const { committeeId } = useParams();
  const navigate = useNavigate();

  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("directors");
  const [directors, setDirectors] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!committeeId) return;

    const loadData = async () => {
      setLoading(true);

      try {
        const [committeeData, directorsData, membersData] = await Promise.all([
          getCommittee(committeeId),
          getCommitteeDirectors(committeeId),
          getCommitteeMembers(committeeId),
        ]);

        setCommittee(committeeData || null);
        setDirectors(directorsData || []);
        setMembers(membersData || []);
      } catch (err) {
        toast.error("Failed to load committee details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [committeeId]);

  const columns = useMemo(
    () => [
      {
        header: "User",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {getInitials(row?.name || "")}
            </div>
            <span>{row?.name || "-"}</span>
          </div>
        ),
      },
      { header: "Email", accessor: "email" },
      {
        header: "Role",
        render: (row) => (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {row?.role}
          </span>
        ),
      },
      {
        header: "Status",
        render: (row) => (
          <span className="px-2 py-1 text-xs rounded-full bg-muted">
            {row?.status}
          </span>
        ),
      },
    ],
    [],
  );

  /* ---------------- Skeleton UI ---------------- */

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-7 w-48" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-4 bg-card space-y-3"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
        </div>

        {/* Description Skeleton */}
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Tabs Skeleton */}
        <div className="border border-border rounded-xl p-4 bg-card space-y-4">
          <Skeleton className="h-10 w-48" />

          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!committee) {
    return <div className="p-6">No data found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-secondary">
          {committee?.name}
        </h1>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Type" value={committee?.type} />
        <InfoCard label="Members Count" value={committee?.membersCount} />
        <InfoCard label="Plan ID" value={committee?.planID} />
        <InfoCard label="Created By" value={committee?.createdBy} />
      </div>

      {/* Description */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <p className="text-sm text-muted-foreground mb-1">Description</p>
        <p>{committee?.description || "-"}</p>
      </div>

      {/* WhatsApp */}
      <div className="border border-border rounded-xl p-4 bg-card">
        <p className="text-sm text-muted-foreground mb-1">WhatsApp Group</p>

        {committee?.whatsappGroupLink ? (
          <a
            href={committee.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {committee.whatsappGroupLink}
          </a>
        ) : (
          <p className="text-muted-foreground">No link available</p>
        )}
      </div>

      {/* Tabs */}
      <div className="border border-border rounded-xl bg-card">
        <div className="flex border-b border-border">
          <TabButton
            active={activeTab === "directors"}
            onClick={() => setActiveTab("directors")}
            label={`Directors (${directors.length})`}
          />
          <TabButton
            active={activeTab === "members"}
            onClick={() => setActiveTab("members")}
            label={`Members (${members.length})`}
          />
        </div>

        <div className="p-4">
          {activeTab === "directors" && (
            <Table columns={columns} data={directors} />
          )}
          {activeTab === "members" && (
            <Table columns={columns} data={members} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CommitteeDetails;
