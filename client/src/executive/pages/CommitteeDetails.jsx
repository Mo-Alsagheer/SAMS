import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Button } from "@/components/ui/button";

function CommitteeDetails() {
  const { committeeId } = useParams();

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
            <span className="font-medium">{row?.name || "-"}</span>
          </div>
        ),
      },
      { header: "Email", render: (row) => (<span>{row.email}</span>) },
      {
        header: "Role",
        render: (row) => (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize">
            {row?.role}
          </span>
        ),
      },
      {
        header: "Status",
        render: (row) => (
          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground capitalize">
            {row?.status}
          </span>
        ),
      },
    ],
    []
  );

  /* ---------------- Loading UI ---------------- */
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-40" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border bg-card space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>

        <div className="p-4 border rounded-xl space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No committee data found
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="space-y-2">
        <Link to="/executive/committees">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Committees
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {committee?.name}
        </h1>

        <p className="text-sm text-muted-foreground">
          Committee overview and management details
        </p>
      </div>

      {/* Info Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard label="Type" value={committee?.type} />
          <InfoCard label="Members Count" value={committee?.membersCount} />
          {/* <InfoCard label="Plan ID" value={committee?.planID} />
          <InfoCard label="Created By" value={committee?.createdBy} /> */}
        </div>
      </div>

      {/* Description */}
      <div className="p-5 border rounded-xl bg-card space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Description
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          {committee?.description || "No description available"}
        </p>
      </div>

      {/* WhatsApp */}
      <div className="p-5 border rounded-xl bg-card space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          WhatsApp Group
        </h2>

        {committee?.whatsappGroupLink ? (
          <a
            href={committee.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm break-all"
          >
            Join WhatsApp Group
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            No WhatsApp group linked
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border rounded-xl bg-card overflow-hidden">

        <div className="flex border-b">
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