import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SuccessPage = () => {
  const navigate = useNavigate();

  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); 
    }, 5000);

    return () => clearTimeout(timer); 
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-10 pb-8 px-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white/20 p-4 rounded-full">
              <CheckCircle2 size={60} className="text-blue-100 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black italic">Success!</h2>
            <p className="text-blue-100 font-medium text-lg">
              Your Application Submitted and will be reviewed soon.
            </p>
          
          </div>

       
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;