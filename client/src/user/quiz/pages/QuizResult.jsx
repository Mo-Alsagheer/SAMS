import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Award, RefreshCw, BarChart3, HelpCircle } from "lucide-react";

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { result } = location.state || { result: null };

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-full"><HelpCircle size={32} /></div>
          <p className="text-slate-500 font-bold text-lg">No evaluation data found.</p>
          <button onClick={() => navigate("/quiz")} className="bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">
            Take the Quiz
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const recommendedCommittee = result.recommendedCommittee || "Evaluation Completed";
  const scores = result.scores || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-xl bg-white shadow-[0_15px_40px_rgba(30,58,138,0.06)] rounded-3xl p-8 border border-slate-100 text-center space-y-8 animate-in fade-in zoom-in-95 duration-400">
          
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award size={40} />
          </div>

          <div className="space-y-2">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Our Recommendation</p>
            <h1 className="text-3xl font-black text-blue-950 tracking-tight">{recommendedCommittee}</h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              Based on your evaluation responses, your choices show high compatibility for this committee.
            </p>
          </div>

          {scores && Object.keys(scores).length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200 pb-2">
                <BarChart3 size={18} className="text-blue-800" />
                <span>Compatibility Breakdown</span>
              </div>
              <div className="space-y-3">
                {Object.entries(scores).map(([committee, score]) => {
                  const maxPossibleScore = 3; 
                  const percentage = Math.min((score / maxPossibleScore) * 100, 100);

                  return (
                    <div key={committee} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{committee}</span>
                        <span className="text-blue-900">{score} pts</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-700 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/quiz")} className="px-6 py-3 bg-blue-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
              <RefreshCw size={16} /> Try Another Track
            </button>
            <button onClick={() => navigate("/")} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm">
              Back to Home
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default QuizResult;