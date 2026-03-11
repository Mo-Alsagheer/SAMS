import React, { useState, useEffect } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Cards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    axios.get("https://jsonplaceholder.typicode.com/photos?_limit=3")
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

  if (loading) return <div className="text-center py-10 font-bold text-blue-800">Loading Events...</div>;

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
                src={item.url || "https://avatar.vercel.sh/shadcn1"}
                alt="Committee cover"
                className="relative z-20 w-full h-full object-cover brightness-60 grayscale dark:brightness-40 transition-all duration-500 hover:grayscale-0 hover:brightness-90"
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
                  {item.status === "open" ? "Open" : "Closed"}
                </Badge>
              </div>
              <CardTitle className="line-clamp-1 text-xl font-bold">
                {item.name || item.title}
              </CardTitle>
             
            </CardHeader>

            <CardFooter >
              <Button className="w-full p-5 bg-blue-800 hover:bg-blue-900 text-white text-lg transition-all duration-200 hover:scale-[0.96] active:scale-90 shadow-md">
                View Committee
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Cards;