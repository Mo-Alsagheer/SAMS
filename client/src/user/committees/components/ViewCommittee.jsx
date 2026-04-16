import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCommittees } from "@/features/committee/committee";

function ViewCommittee() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setLoading(true);
        const result = await getCommittees();
        const committeesArray = Array.isArray(result) ? result : (result.data || []);

        const formattedData = committeesArray.map((item) => ({
          id: item.id,
          displayTitle: item.name,
          description: item.description || "Join our community and explore new opportunities.",
          status: item.status || "open",
          image: item.url || "https://avatar.vercel.sh/shadcn1"
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching committees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
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
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Committees</span>
            </h1>
            <div className="h-1.5 w-24 bg-blue-400 mx-auto rounded-full"></div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 py-16" dir="ltr">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {data.map((item) => (
              <Card
                key={item.id}
                className="relative w-full pt-0 overflow-hidden border-none bg-card transition-all duration-500 ease-in-out
                           shadow-[0_0_25px_rgba(59,130,246,0.3)] 
                           hover:-translate-y-3 hover:scale-[1.03]
                           hover:shadow-[0_0_50px_rgba(37,99,235,0.7)]"
              >
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 z-30 bg-black/35 pointer-events-none" />
                  <img
                    src={item.image}
                    alt={item.displayTitle}
                    className="relative z-20 w-full h-full object-cover brightness-60 grayscale transition-all duration-500 hover:grayscale-0 hover:brightness-90"
                  />
                </div>

                <CardHeader className="space-y-1 p-5">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        item.status.toLowerCase() === "open"
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
                    onClick={() => navigate(`/committee/${item.id}`)}
                    className="w-full p-5 bg-blue-800 hover:bg-blue-900 text-white text-lg transition-all duration-200 hover:scale-[0.96] active:scale-90 shadow-md"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ViewCommittee;