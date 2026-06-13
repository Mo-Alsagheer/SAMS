import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { Calendar, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, Award } from "lucide-react";

import { getGlobalRecruitment } from "@/features/recruitment/recruitment";

const STATIC_ROLES = [
  {
    id: 1,
    title: "Web Master & Technical Director",
    description: "The Web Master & Technical Director is responsible for leading and overseeing all technical activities within the branch, ensuring the successful planning, execution, and development of technical committees throughout the season.",
    responsibilities: [
      "Develop the overall technical roadmap, including selecting learning tracks, defining topics, and choosing the most suitable technologies and frameworks.",
      "Recruit and supervise Technical Committee Directors, providing continuous guidance and support throughout the season.",
      "Monitor the progress of each technical committee, helping solve challenges, improve workflows, and implement new ideas and initiatives.",
      "Act as the primary communication bridge between the Technical Committees and the Executive Committee (EX-COM).",
      "Track members' learning progress and ensure that planned content and educational objectives are achieved."
    ],
    skills: ["Leadership", "Strategic Planning", "Technical Knowledge", "Problem Solving", "Team Management"]
  },
  {
    id: 2,
    title: "Treasurer",
    description: "The Treasurer is responsible for managing the branch's external relations, financial planning, partnerships, sponsorships, and logistical coordination while representing the branch professionally.",
    responsibilities: [
      "Lead and supervise the Public Relations Committee.",
      "Develop a PR and external relations strategy aligned with the branch's objectives.",
      "Manage relationships with sponsors, speakers, companies, and partners.",
      "Coordinate the logistical and financial aspects of branch activities and events.",
      "Oversee budget planning and resource allocation."
    ],
    skills: ["Financial Planning", "Negotiation", "Partnership Management", "Event Management", "Communication"]
  },
  {
    id: 3,
    title: "Secretary",
    description: "The Secretary ensures the smooth coordination and execution of the branch's operations, connects committees, monitors performance, and maintains alignment with the branch's vision.",
    responsibilities: [
      "Coordinate internal operations across all committees.",
      "Monitor the implementation of the Chairman's seasonal vision.",
      "Maintain communication and collaboration between committees.",
      "Track members' and committees' performance through evaluation systems.",
      "Create a motivating and collaborative team environment."
    ],
    skills: ["Organization", "Time Management", "Leadership", "Performance Evaluation", "Communication"]
  },
  {
    id: 4,
    title: "Chairman",
    description: "The Chairman is the overall leader of the branch, responsible for defining its vision, leading the Executive Committee, and ensuring that every committee works toward common strategic goals.",
    responsibilities: [
      "Develop the branch's vision, strategy, and seasonal roadmap.",
      "Build and lead the Executive Committee.",
      "Oversee the performance of all committees and ensure alignment.",
      "Make strategic decisions and adapt plans when needed.",
      "Represent the branch internally and externally."
    ],
    skills: ["Strategic Leadership", "Decision Making", "Team Building", "Communication", "Project Management"]
  }
];

function ExecutiveRoles() {
  const [rolesData, setRolesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResp, setExpandedResp] = useState({}); 
  const [expandedSkills, setExpandedSkills] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchGlobalStatus = async () => {
     
      console.log("🚀 STARTING FETCH: useEffect triggered successfully!");
      
      try {
        if (isMounted) setLoading(true);

        console.log("📡 Calling SAMS API...");
        const apiPromise = getGlobalRecruitment();
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        const response = await Promise.race([apiPromise, timeoutPromise]);
        console.log("✅ SAMS API Response received:", response);

        const dataArray = Array.isArray(response) 
          ? response 
          : (response && typeof response === 'object' ? [response] : []);
        
        const mergedData = STATIC_ROLES.map((staticRole) => {
          const apiRole = dataArray.find(r => {
            if (!r || !r.title) return false;
            return r.title.trim().toLowerCase() === staticRole.title.trim().toLowerCase();
          });

          const fallbackRole = !apiRole 
            ? dataArray.find(r => r && r.title && staticRole.title.toLowerCase().includes(r.title.toLowerCase()))
            : null;

          const activeSource = apiRole || fallbackRole;
          const apiStatus = activeSource?.status?.toLowerCase() || "closed";
          const rawClosedAt = activeSource?.closedAt;
          
          const formattedDate = rawClosedAt
            ? new Date(rawClosedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            : null;

          return {
            ...staticRole,
            dbId: activeSource?.id || staticRole.id, 
            status: apiStatus,
            closedAt: formattedDate
          };
        });

        if (isMounted) setRolesData(mergedData);
      } catch (error) {
        console.error("❌ CATCH BLOCK TRIGGERED:", error);
      
        if (isMounted) {
          setRolesData(STATIC_ROLES.map(r => ({ ...r, status: "open", closedAt: null })));
          toast.error("Using offline fallback mode.");
        }
      } finally {
        console.log("🏁 FINALLY BLOCK: Setting loading to false");
        if (isMounted) setLoading(false);
      }
    };

    fetchGlobalStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleResponsibilities = (id) => {
    setExpandedResp(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSkills = (id) => {
    setExpandedSkills(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center font-bold text-blue-900 dark:text-blue-400 animate-pulse">
          Loading Executive Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow pt-16">
        <section className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 py-14 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 container mx-auto px-6 max-w-3xl space-y-3">
            <div className="mx-auto w-fit p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
              Executive Board <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Positions</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium">
              Select an executive role to view full responsibilities, required skills, and push forward your leadership application.
            </p>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 py-12" dir="ltr">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {rolesData.map((item) => {
              const isRespOpen = !!expandedResp[item.id];
              const isSkillsOpen = !!expandedSkills[item.id];

              return (
                <Card
                  key={item.id}
                  className="relative w-full overflow-hidden bg-white dark:bg-slate-900 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30"
                >
                  <div>
                    <CardHeader className="space-y-4 p-6 md:p-8 pb-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            item.status === "open"
                              ? "bg-green-500/10 text-green-600 border-green-500/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                              : "bg-red-500/10 text-red-500 border-red-500/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                          }
                        >
                          {item.status.toUpperCase()}
                        </Badge>

                        {item.status === "open" && item.closedAt && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                            <Calendar size={13} className="text-blue-500 dark:text-blue-400" />
                            <span>Closes at: {item.closedAt}</span>
                          </div>
                        )}
                      </div>

                      <CardTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {item.title}
                      </CardTitle>

                      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                        {item.description}
                      </p>
                    </CardHeader>

                    <div className="px-6 md:px-8 space-y-3">
                      <div>
                        <button
                          onClick={() => toggleResponsibilities(item.id)}
                          className="flex items-center justify-between w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-400 rounded-xl transition-colors border border-slate-100 dark:border-slate-800"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-blue-500" /> 
                            Responsibilities
                          </span>
                          {isRespOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isRespOpen && (
                          <div className="mt-2 p-4 bg-slate-50/40 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900 animate-fadeIn">
                            <ul className="space-y-2">
                              {item.responsibilities.map((resp, idx) => (
                                <li key={idx} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed pl-1">
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => toggleSkills(item.id)}
                          className="flex items-center justify-between w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-400 rounded-xl transition-colors border border-slate-100 dark:border-slate-800"
                        >
                          <span className="flex items-center gap-1.5">
                            <Award size={14} className="text-cyan-500" /> 
                            Core Skills
                          </span>
                          {isSkillsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isSkillsOpen && (
                          <div className="mt-2 p-4 bg-slate-50/40 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900 animate-fadeIn">
                            <div className="flex flex-wrap gap-2">
                              {item.skills.map((skill, idx) => (
                                <span key={idx} className="text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 px-3 py-1 rounded-lg shadow-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardFooter className="p-6 md:p-8 pt-6">
                    <Button
                      disabled={item.status !== "open"}
                      onClick={() => {
                        if (item.status === "open") {
                          navigate(`/executive/apply/${item.dbId}`);
                        } else {
                          toast.error("Recruitment is currently closed.");
                        }
                      }}
                      className={`w-full p-5 text-white text-sm font-bold rounded-xl transition-all shadow-sm ${
                        item.status === "open"
                          ? "bg-blue-600 hover:bg-blue-700 active:scale-98"
                          : "bg-slate-400 dark:bg-slate-800 text-slate-300 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {item.status === "open" ? "Apply Now" : "Recruitment Closed"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ExecutiveRoles;