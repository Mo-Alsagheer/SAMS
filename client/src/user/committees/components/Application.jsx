import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PopupForm } from "@/components/shared/PopupForm"; 

import { getCommittees } from "@/features/committee/committee";
import { submitApplication } from "@/features/applications/applications";
import { getCommitteeRecruitmentStatus, getGlobalRecruitment } from "@/features/recruitment/recruitment";

const formSchema = z.object({
  committeeName: z.string().min(1, "Please select a committee"),
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  linkedinLink: z.string().url("Please enter a valid LinkedIn URL"),
  cvLink: z.string().url("Please enter a valid CV link"),
});

const Application = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [committees, setCommittees] = useState([]);
  const [selectedCommitteeData, setSelectedCommitteeData] = useState(null);

  const [defaultValues, setDefaultValues] = useState({
    committeeName: "",
    fullName: "",
    email: "",
    phone: "",
    linkedinLink: "",
    cvLink: "",
  });

  const [globalProcesses, setGlobalProcesses] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [committeesData, globalData] = await Promise.all([
          getCommittees(),
          getGlobalRecruitment(),
        ]);
        setCommittees(committeesData);
        setGlobalProcesses(globalData.filter((p) => p.status === "OPEN"));

        if (id && committeesData.length > 0) {
          const selected = committeesData.find(
            (com) => String(com._id || com.id) === String(id)
          );
          if (selected) {
            setSelectedCommitteeData(selected);
            setDefaultValues((prev) => ({
              ...prev,
              committeeName: selected.name,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading application data:", error);
        toast.error("Failed to load committees and roles.");
      }
    };
    loadData();
  }, [id]);

  const fields = [
    {
      name: "committeeName",
      label: "Committee / Position",
      type: "select",
      options: [
        { value: "", label: "Select Position" },
        ...committees.map((com) => ({
          value: com.name,
          label: com.name,
        })),
        ...globalProcesses.map((p) => ({
          value: p.title,
          label: p.title,
        })),
      ],
    },
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "email@example.com",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "01xxxxxxxxx",
    },
    {
      name: "linkedinLink",
      label: "LinkedIn Profile",
      type: "text",
      placeholder: "https://linkedin.com/...",
    },
    {
      name: "cvLink",
      label: "CV Link",
      type: "text",
      placeholder: "Drive or Dropbox link",
    },
  ];

  const onSubmit = async (values) => {
    try {
      const globalProc = globalProcesses.find(
        (p) => p.title === values.committeeName
      );

      if (globalProc) {
        const apiData = {
          processId: globalProc.id,
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
        return;
      }

      const finalCommittee =
        selectedCommitteeData ||
        committees.find((c) => c.name === values.committeeName);

      const committeeIdVal = finalCommittee?._id || finalCommittee?.id || id;
      if (!committeeIdVal) {
        toast.error("Invalid committee selection.");
        return;
      }

      // Fetch status to get the active process ID
      const statusRes = await getCommitteeRecruitmentStatus(committeeIdVal);
      const openProcess =
        statusRes?.processes?.find(
          (p) => p.status === "OPEN" && p.role === "MEMBER"
        ) || statusRes?.processes?.find((p) => p.status === "OPEN");

      if (!openProcess) {
        toast.error("No active recruitment process found for this committee.");
        return;
      }

      const apiData = {
        processId: openProcess.id,
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
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <Navbar />
      <main className="flex-grow flex justify-center items-center p-4 pt-24 pb-10">
        {isSubmitted ? (
          <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden animate-in fade-in zoom-in duration-500">
            <CardContent className="pt-10 pb-8 px-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-white/20 p-4 rounded-full">
                  <CheckCircle2
                    size={60}
                    className="text-blue-100 animate-bounce"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic">Success!</h2>
                <p className="text-blue-100 font-medium text-lg">
                  Your Application Submitted and will be reviewed soon.
                </p>
                <p className="text-blue-200/60 text-sm italic">
                  Redirecting to home...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <PopupForm
            open={true}
            onClose={() => navigate("/")} 
            schema={formSchema}
            defaultValues={defaultValues}
            fields={fields}
            onSubmit={onSubmit}
            title="Apply to IEEE Community"
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
              [&[type='submit']]:bg-primary [&[type='submit']]:text-white [&[type='submit']]:hover:bg-blue-900 
              dark:[&[type='submit']]:bg-blue-700 dark:[&[type='submit']]:hover:bg-blue-600"
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Application;