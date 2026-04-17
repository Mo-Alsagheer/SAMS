import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getCommittees } from "@/features/committee/committee";

function Cards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommittees = async () => {
      try {
        setLoading(true);
        const result = await getCommittees();

        
        const committeesArray = Array.isArray(result) ? result : (result.data || []);

        
        const formattedData = committeesArray.slice(0, 3).map((item) => ({
          id: item.id,
          displayTitle: item.name, 
  
          status: item.status || "open", 
          image: item.url || "https://avatar.vercel.sh/shadcn1",
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load committees");
      } finally {
        setLoading(false);
      }
    };

    fetchCommittees();
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

  if (error) {
    return (
      <div className="text-center py-10 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12 text-left" dir="ltr">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
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
                    item.status === "open"
                      ? "bg-green-500/10 text-green-500 border-green-500/20 text-sm"
                      : "bg-red-500/10 text-red-500 border-red-500/20 text-sm"
                  }
                >
               
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Badge>
              </div>
              <CardTitle className="line-clamp-1 text-xl font-bold">
                {item.displayTitle}
              </CardTitle>
            </CardHeader>

            <CardFooter>
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
  );
}

export default Cards;