import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCommittee } from "@/features/committee/committee";
import { getCommitteeRecruitmentStatus } from "@/features/recruitment/recruitment";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

export default function CommitteeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchCommitteeDetails = async () => {
      try {
        setLoading(true);
        const item = await getCommittee(id);
        
        let currentStatus = "CLOSED";
        try {
          const statusRes = await getCommitteeRecruitmentStatus(id);
          if (statusRes?.status?.toUpperCase() === "OPEN" || statusRes?.isOpen === true) {
            currentStatus = "OPEN";
          }
        } catch (statusErr) {
          console.error(statusErr);
        }

        setCommittee({
          id: item._id || item.id,
          name: item.name,
          description: item.description || "No description provided yet for this technical committee.",
          type: item.type,
          membersCount: item.membersCount || 0,
          whatsapp: item.whatsappGroupLink,
          status: currentStatus,
          image: item.imageUrl || "https://avatar.vercel.sh/shadcn1",
        });
      } catch (error) {
        console.error(error);
        toast.error("Could not load committee details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCommitteeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-center">
        <Navbar />
        <main className="flex-grow pt-32 text-slate-500 font-medium">
          Committee not found.
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto py-10">
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-16 items-start">
            <div className="w-full lg:w-[45%] aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-50 border-4 border-slate-50">
              <img
                src={committee.image}
                alt={committee.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700 ease-out"
              />
            </div>

            <div className="w-full lg:w-[55%] pt-6 lg:pt-10">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    committee.status.toUpperCase() === "OPEN" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  ● {committee.status}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                  {committee.type}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-4xl font-black italic uppercase text-slate-950 tracking-tighter leading-tight mb-4">
                {committee.name}
              </h1>

              <p className="text-slate-400 font-bold mb-8 text-sm">
                Members: {committee.membersCount}
              </p>

              <div className="max-w-2xl border-l-4 border-blue-600 pl-6 mb-12">
                <p className="text-slate-600 text-xl font-medium leading-relaxed">
                  {committee.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => {
                    navigate(`/application/${committee.id}`);
                  }}
                  className="bg-blue-700 text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20 px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 uppercase tracking-widest text-xs inline-block text-center"
                >
                  APPLY TO JOIN
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="bg-transparent border-2 border-slate-200 text-slate-500 hover:bg-slate-50 shadow-none px-6 py-4 rounded-2xl font-bold transition-all text-sm flex items-center gap-2"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}