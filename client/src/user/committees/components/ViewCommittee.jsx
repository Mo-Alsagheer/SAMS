import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCommittees } from "@/features/committee/committee";
import { getCommitteeRecruitmentStatus } from "@/features/recruitment/recruitment";
import { toast } from "sonner";

function ViewCommittee() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommitteesWithStatus = async () => {
      try {
        setLoading(true);
        const result = await getCommittees();
        const committeesArray = Array.isArray(result) ? result : (result.data || []);

        const baseData = committeesArray.map((item) => ({
          id: item._id || item.id,
          displayTitle: item.name,
          description: item.description || "Join our community and explore new opportunities.",
          status: "closed", 
          image: item.imageUrl || "https://avatar.vercel.sh/shadcn1",
        }));

        setData(baseData);

        baseData.forEach(async (committee) => {
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
            console.error(`Status error for ${committee.displayTitle}:`, err);
          }
        });

      } catch (error) {
        console.error("Error fetching committees:", error);
        toast.error("Failed to load committees. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommitteesWithStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center font-bold text-blue-800 animate-pulse">
          Loading Committees...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow pt-16">
        <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800 to-blue-900/70"></div>
          <div className="relative z-10 container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter uppercase italic">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Committees
              </span>
            </h1>
            <div className="h-1.5 w-24 bg-blue-400 mx-auto rounded-full"></div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 py-16" dir="ltr">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {data.length > 0 ? (
              data.map((item) => (
                <Card
                  key={item.id}
                  className={`relative w-full pt-0 overflow-hidden border-none bg-card transition-all duration-500 ease-in-out shadow-[0_0_25px_rgba(59,130,246,0.3)] ${
                    item.status === "open" 
                      ? "hover:-translate-y-3 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(37,99,235,0.7)]" 
                      : "opacity-95 shadow-none border border-slate-200"
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
                    <p className="text-slate-400 text-base line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </CardHeader>

                  <CardFooter className="p-5 pt-0">
                    <Button
                      disabled={item.status !== "open"}
                      onClick={() => {
                        if (item.status === "open") {
                          navigate(`/committee/${item.id}`);
                        } else {
                          toast.error("Recruitment is currently closed.");
                        }
                      }}
                      className={`w-full p-5 text-white text-lg transition-all duration-200 shadow-md ${
                        item.status === "open" 
                          ? "bg-blue-800 hover:bg-blue-900 hover:scale-[0.96] active:scale-90" 
                          : "bg-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {item.status === "open" ? "View Details" : "Closed"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-400">
                No committees available right now.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ViewCommittee;