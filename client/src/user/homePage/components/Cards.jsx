import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getCommittees } from "@/features/committee/committee";
import { getCommitteeRecruitmentStatus } from "@/features/recruitment/recruitment";
import { toast } from "sonner";

function Cards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommitteesData = async () => {
      try {
        setLoading(true);
        const result = await getCommittees();
        const committeesArray = Array.isArray(result) ? result : (result.data || []);

        const baseCommittees = committeesArray.slice(0, 3).map((item) => ({
          id: item._id || item.id,
          displayTitle: item.name,
          description: item.description || "Join our community and explore new opportunities.",
          image: item.imageUrl || "https://avatar.vercel.sh/shadcn1",
          status: "closed", 
        }));

        setData(baseCommittees);

        baseCommittees.forEach(async (committee) => {
          try {
            const statusRes = await getCommitteeRecruitmentStatus(committee.id);
            
            const isActuallyOpen = 
              statusRes?.status?.toUpperCase() === "OPEN" || 
              statusRes?.isOpen === true;

            setData((prev) =>
              prev.map((item) =>
                item.id === committee.id
                  ? { ...item, status: isActuallyOpen ? "open" : "closed" }
                  : item
              )
            );
          } catch (err) {
            console.error(`Error fetching status for ${committee.displayTitle}:`, err);
          }
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load committees.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteesData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center py-10 font-bold text-blue-800 animate-pulse">
          Loading Committees...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12 text-left" dir="ltr">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {data.map((item) => (
          <Card
            key={item.id}
            className={`relative w-full pt-0 overflow-hidden border-none bg-card transition-all duration-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] ${
              item.status === "open" ? "hover:-translate-y-3 hover:scale-[1.03]" : "opacity-95"
            }`}
          >
            <div className="relative aspect-video overflow-hidden">
              <div className="absolute inset-0 z-30 bg-black/35 pointer-events-none" />
              <img
                src={item.image}
                alt={item.displayTitle}
                className={`relative z-20 w-full h-full object-cover transition-all duration-500 ${
                  item.status === "open" ? "grayscale-0 brightness-90" : "grayscale brightness-50"
                }`}
              />
            </div>

            <CardHeader className="space-y-1 p-5">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    item.status === "open"
                      ? "bg-green-500/10 text-green-500 border-green-500/20 text-sm"
                      : "bg-red-500/10 text-red-500 border-red-500/20 text-sm"
                  }
                >
                  {item.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="line-clamp-1 text-xl font-bold">
                {item.displayTitle}
              </CardTitle>
              <p className="text-slate-400 text-sm line-clamp-2 mt-2">
                {item.description}
              </p>
            </CardHeader>

            <CardFooter>
              <Button
                disabled={item.status !== "open"}
                onClick={() => navigate(`/committee/${item.id}`)}
                className={`w-full p-5 text-white text-lg transition-all duration-200 shadow-md ${
                  item.status === "open" 
                    ? "bg-blue-800 hover:bg-blue-900 active:scale-95" 
                    : "bg-slate-500 cursor-not-allowed"
                }`}
              >
                {item.status === "open" ? "View Details" : "Closed"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Cards;