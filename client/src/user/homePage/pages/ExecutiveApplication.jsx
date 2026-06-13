import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PopupForm } from "@/components/shared/PopupForm"; 
import { getRecruitmentById } from "@/features/recruitment/recruitment";
import { submitApplication } from "@/features/applications/applications";

const STATIC_ROLES = [
  { id: 1, title: "Web Master & Technical Director" },
  { id: 2, title: "Treasurer" },
  { id: 3, title: "Secretary" },
  { id: 4, title: "Chairman" }
];

const formSchema = z.object({
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  linkedinLink: z.string().url("Please enter a valid LinkedIn URL"),
  cvLink: z.string().url("Please enter a valid CV link"),
});

const ExecutiveApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [roleTitle, setRoleTitle] = useState("Executive Position");
  const [loading, setLoading] = useState(true);

  const [defaultValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedinLink: "",
    cvLink: "",
  });

  useEffect(() => {
    const loadRecruitmentData = async () => {
      if (!id) return;
      
      try {
        const localRole = STATIC_ROLES.find((role) => String(role.id) === String(id));
        if (localRole) {
          setRoleTitle(localRole.title);
        }

        const recruitmentData = await getRecruitmentById(id);
        console.log("Recruitment API Response:", recruitmentData);

        if (recruitmentData?.title || recruitmentData?.name) {
          setRoleTitle(recruitmentData.title || recruitmentData.name);
        }

        if (recruitmentData?.status?.toLowerCase() === "closed") {
          toast.error("This position is currently closed.");
          navigate("/executiveRoles");
          return; 
        }

      } catch (error) {
        console.error("Error loading recruitment:", error);
     
        toast.error("Could not verify dynamic status, proceeding with default settings.");
      } finally {

        setLoading(false);
      }
    };

    loadRecruitmentData();
  }, [id, navigate]);

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter your name" },
    { name: "email", label: "Email", type: "email", placeholder: "email@example.com" },
    { name: "phone", label: "Phone", type: "text", placeholder: "01xxxxxxxxx" },
    { name: "linkedinLink", label: "LinkedIn Profile", type: "text", placeholder: "https://linkedin.com/..." },
    { name: "cvLink", label: "CV Link", type: "text", placeholder: "Drive or Dropbox link" },
  ];

  const onSubmit = async (values) => {
    try {
      const apiData = {
        processId: id, 
        name: values.fullName,
        email: values.email,
        phone: values.phone,
        linkedinLink: values.linkedinLink,
        cvLink: values.cvLink,
      };

      await submitApplication(apiData);
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Something went wrong";
      toast.error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading position details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <Navbar />
      <main className="flex-grow flex justify-center items-center p-4 pt-24 pb-10">
        {isSubmitted ? (
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
                <p className="text-blue-200/60 text-sm italic">Redirecting to home...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PopupForm
            open={true}
            onClose={() => navigate("/executiveRoles")} 
            schema={formSchema}
            defaultValues={defaultValues}
            fields={fields}
            onSubmit={onSubmit}
            title={`Apply for ${roleTitle}`}
            submitLabel="Submit Application"
            className="max-w-2xl w-[94%] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] md:rounded-[32px]"
            bgColor="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_15px_50px_rgba(59,130,246,0.06)]"
            titleColor="text-blue-900 dark:text-slate-100 font-black text-xl md:text-2xl pt-2 text-center tracking-tight"
            labelColor="text-[11px] md:text-sm font-bold text-blue-900/70 dark:text-slate-300 mb-1 block ml-1"
            submitClassName="text-xs font-bold !h-9 !px-4 !rounded-lg transition-all duration-200 active:scale-95 !w-auto shadow-sm inline-flex items-center justify-center
              [&:parent]:flex-row [&:parent]:justify-end [&:parent]:gap-2
              [&[type='button']]:!w-auto [&[type='button']]:!inline-flex
              [&[type='button']]:!bg-slate-100 [&[type='button']]:!text-slate-700 [&[type='button']]:hover:!bg-slate-200 [&[type='button']]:!border-none 
              dark:[&[type='button']]:!bg-slate-800 dark:[&[type='button']]:!text-slate-300 dark:[&[type='button']]:hover:!bg-slate-700
              [&[type='submit']]:!w-auto [&[type='submit']]:!inline-flex
              [&[type='submit']]:bg-blue-600 [&[type='submit']]:text-white [&[type='submit']]:hover:bg-blue-700 
              dark:[&[type='submit']]:bg-blue-700 dark:[&[type='submit']]:hover:bg-blue-600"
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExecutiveApplication;




