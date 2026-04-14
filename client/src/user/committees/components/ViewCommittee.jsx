import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function ViewCommittee() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/photos?_limit=6")
      .then((response) => {
        const committeeData = response.data.map((item, index) => ({
          ...item,
          status: index % 2 === 0 ? "open" : "closed",
          name: item.title,
        }));
        setData(committeeData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center font-bold text-blue-800 animate-pulse">
          Loading Events...
        </div>
      </div>
    );

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
            {data.map((item) => (
              <Card
                key={item.id}
                className="relative w-full overflow-hidden border-none bg-white transition-all duration-500 ease-in-out
                           shadow-[0_10px_30px_rgba(59,130,246,0.15)] 
                           hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
              >
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-blue-900/10 pointer-events-none" />
                  <img
                    src={item.url || "https://avatar.vercel.sh/shadcn1"}
                    alt="Committee cover"
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-110"
                  />
                </div>

                <CardHeader className="space-y-3 p-6">
                  <Badge
                    variant="outline"
                    className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.status === "open"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}
                  >
                    {item.status === "open" ? "● Open" : "● Closed"}
                  </Badge>
                  <CardTitle className="line-clamp-2 text-xl font-extrabold text-slate-800 leading-tight min-h-[3.5rem]">
                    {item.name}
                  </CardTitle>
                </CardHeader>

                <CardFooter className="p-6 pt-0">
                  <Button 
                    onClick={() => navigate(`/committee/${item.id}`)}
                    className="w-full py-6 bg-blue-700 hover:bg-blue-800 text-base text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
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